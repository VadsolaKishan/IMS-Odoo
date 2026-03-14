"""
Inventory services – Business logic for stock transactions.

All stock operations are wrapped in database transactions with
SELECT ... FOR UPDATE to prevent race conditions. Stock can NEVER go negative.
"""

import logging
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.warehouses.models import StockRecord

from .models import (
    DeliveryOrder,
    InternalTransfer,
    InventoryAdjustment,
    Receipt,
    StockLedger,
)

logger = logging.getLogger(__name__)


class InsufficientStockError(Exception):
    """Raised when stock would go negative."""

    pass


class InvalidOperationError(Exception):
    """Raised when an operation is invalid."""

    pass


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _get_or_create_stock(product, location):
    """Get or create a stock record, locking the row for update."""
    stock, created = StockRecord.objects.select_for_update().get_or_create(
        product=product,
        location=location,
        defaults={"quantity": Decimal("0")},
    )
    return stock


def _create_ledger_entry(
    product,
    operation_type,
    quantity_change,
    quantity_after,
    reference,
    performed_by,
    source_location=None,
    destination_location=None,
    notes="",
):
    """Create an immutable stock ledger entry."""
    return StockLedger.objects.create(
        product=product,
        operation_type=operation_type,
        quantity_change=quantity_change,
        quantity_after=quantity_after,
        source_location=source_location,
        destination_location=destination_location,
        reference=reference,
        performed_by=performed_by,
        notes=notes,
    )


# ---------------------------------------------------------------------------
# Receipt Validation (Incoming Stock)
# ---------------------------------------------------------------------------
@transaction.atomic
def validate_receipt(receipt_id: int, user) -> Receipt:
    """
    Validate a receipt: increase stock at the destination location.

    Steps:
      1. Lock the receipt (prevent double validation)
      2. For each line, increase stock at destination location
      3. Create ledger entries
      4. Update receipt status
    """
    receipt = (
        Receipt.objects.select_for_update()
        .prefetch_related("lines__product")
        .get(id=receipt_id)
    )

    if receipt.status != Receipt.Status.DRAFT and receipt.status != Receipt.Status.CONFIRMED:
        raise InvalidOperationError(
            f"Cannot validate receipt {receipt.reference} with status '{receipt.status}'."
        )

    if not receipt.lines.exists():
        raise InvalidOperationError(
            f"Receipt {receipt.reference} has no lines to validate."
        )

    for line in receipt.lines.all():
        stock = _get_or_create_stock(line.product, receipt.destination_location)
        stock.quantity += line.quantity
        stock.save()

        _create_ledger_entry(
            product=line.product,
            operation_type=StockLedger.OperationType.RECEIPT,
            quantity_change=line.quantity,
            quantity_after=stock.quantity,
            reference=receipt.reference,
            performed_by=user,
            destination_location=receipt.destination_location,
            notes=f"Receipt from supplier {receipt.supplier.name}",
        )

    receipt.status = Receipt.Status.VALIDATED
    receipt.validated_by = user
    receipt.validated_at = timezone.now()
    receipt.save()

    logger.info("Receipt %s validated by %s", receipt.reference, user.email)
    return receipt


# ---------------------------------------------------------------------------
# Delivery Order Validation (Outgoing Stock)
# ---------------------------------------------------------------------------
@transaction.atomic
def validate_delivery_order(delivery_id: int, user) -> DeliveryOrder:
    """
    Validate a delivery order: decrease stock at source location.

    Steps:
      1. Lock the delivery order
      2. For each line, check stock availability, then decrease
      3. Create ledger entries
      4. Update delivery status

    Raises InsufficientStockError if stock would go negative.
    """
    delivery = (
        DeliveryOrder.objects.select_for_update()
        .prefetch_related("lines__product")
        .get(id=delivery_id)
    )

    if delivery.status not in (
        DeliveryOrder.Status.DRAFT,
        DeliveryOrder.Status.CONFIRMED,
    ):
        raise InvalidOperationError(
            f"Cannot validate delivery {delivery.reference} with status '{delivery.status}'."
        )

    if not delivery.lines.exists():
        raise InvalidOperationError(
            f"Delivery {delivery.reference} has no lines to validate."
        )

    for line in delivery.lines.all():
        stock = _get_or_create_stock(line.product, delivery.source_location)

        if stock.quantity < line.quantity:
            raise InsufficientStockError(
                f"Insufficient stock for {line.product.sku} at "
                f"{delivery.source_location}. "
                f"Available: {stock.quantity}, Required: {line.quantity}."
            )

        stock.quantity -= line.quantity
        stock.save()

        _create_ledger_entry(
            product=line.product,
            operation_type=StockLedger.OperationType.DELIVERY,
            quantity_change=-line.quantity,
            quantity_after=stock.quantity,
            reference=delivery.reference,
            performed_by=user,
            source_location=delivery.source_location,
            notes=f"Delivery to {delivery.customer_name or 'N/A'}",
        )

    delivery.status = DeliveryOrder.Status.VALIDATED
    delivery.validated_by = user
    delivery.validated_at = timezone.now()
    delivery.save()

    logger.info(
        "Delivery %s validated by %s", delivery.reference, user.email
    )
    return delivery


# ---------------------------------------------------------------------------
# Internal Transfer Validation
# ---------------------------------------------------------------------------
@transaction.atomic
def validate_internal_transfer(transfer_id: int, user) -> InternalTransfer:
    """
    Validate an internal transfer: move stock between locations.

    Steps:
      1. Lock the transfer
      2. For each line, decrease from source, increase at destination
      3. Create paired ledger entries (transfer_out + transfer_in)
      4. Update transfer status
    """
    transfer = (
        InternalTransfer.objects.select_for_update()
        .prefetch_related("lines__product")
        .get(id=transfer_id)
    )

    if transfer.status not in (
        InternalTransfer.Status.DRAFT,
        InternalTransfer.Status.CONFIRMED,
    ):
        raise InvalidOperationError(
            f"Cannot validate transfer {transfer.reference} with status '{transfer.status}'."
        )

    if not transfer.lines.exists():
        raise InvalidOperationError(
            f"Transfer {transfer.reference} has no lines to validate."
        )

    if transfer.source_location_id == transfer.destination_location_id:
        raise InvalidOperationError(
            "Source and destination locations cannot be the same."
        )

    for line in transfer.lines.all():
        # Decrease source
        source_stock = _get_or_create_stock(
            line.product, transfer.source_location
        )
        if source_stock.quantity < line.quantity:
            raise InsufficientStockError(
                f"Insufficient stock for {line.product.sku} at "
                f"{transfer.source_location}. "
                f"Available: {source_stock.quantity}, Required: {line.quantity}."
            )

        source_stock.quantity -= line.quantity
        source_stock.save()

        _create_ledger_entry(
            product=line.product,
            operation_type=StockLedger.OperationType.TRANSFER_OUT,
            quantity_change=-line.quantity,
            quantity_after=source_stock.quantity,
            reference=transfer.reference,
            performed_by=user,
            source_location=transfer.source_location,
            destination_location=transfer.destination_location,
            notes=f"Transfer out to {transfer.destination_location}",
        )

        # Increase destination
        dest_stock = _get_or_create_stock(
            line.product, transfer.destination_location
        )
        dest_stock.quantity += line.quantity
        dest_stock.save()

        _create_ledger_entry(
            product=line.product,
            operation_type=StockLedger.OperationType.TRANSFER_IN,
            quantity_change=line.quantity,
            quantity_after=dest_stock.quantity,
            reference=transfer.reference,
            performed_by=user,
            source_location=transfer.source_location,
            destination_location=transfer.destination_location,
            notes=f"Transfer in from {transfer.source_location}",
        )

    transfer.status = InternalTransfer.Status.VALIDATED
    transfer.validated_by = user
    transfer.validated_at = timezone.now()
    transfer.save()

    logger.info(
        "Transfer %s validated by %s", transfer.reference, user.email
    )
    return transfer


# ---------------------------------------------------------------------------
# Inventory Adjustment Validation
# ---------------------------------------------------------------------------
@transaction.atomic
def validate_inventory_adjustment(adjustment_id: int, user) -> InventoryAdjustment:
    """
    Validate an inventory adjustment: set stock to counted quantity.

    Steps:
      1. Lock the adjustment
      2. For each line, record system qty, compute diff, update stock
      3. Create ledger entries
      4. Update adjustment status
    """
    adjustment = (
        InventoryAdjustment.objects.select_for_update()
        .prefetch_related("lines__product")
        .get(id=adjustment_id)
    )

    if adjustment.status not in (
        InventoryAdjustment.Status.DRAFT,
        InventoryAdjustment.Status.CONFIRMED,
    ):
        raise InvalidOperationError(
            f"Cannot validate adjustment {adjustment.reference} "
            f"with status '{adjustment.status}'."
        )

    if not adjustment.lines.exists():
        raise InvalidOperationError(
            f"Adjustment {adjustment.reference} has no lines to validate."
        )

    for line in adjustment.lines.all():
        stock = _get_or_create_stock(line.product, adjustment.location)

        # Record the system quantity at time of validation
        line.system_quantity = stock.quantity
        line.save()

        difference = line.counted_quantity - stock.quantity

        if stock.quantity + difference < 0:
            raise InsufficientStockError(
                f"Adjustment would result in negative stock for "
                f"{line.product.sku} at {adjustment.location}. "
                f"System: {stock.quantity}, Counted: {line.counted_quantity}."
            )

        stock.quantity = line.counted_quantity
        stock.save()

        _create_ledger_entry(
            product=line.product,
            operation_type=StockLedger.OperationType.ADJUSTMENT,
            quantity_change=difference,
            quantity_after=stock.quantity,
            reference=adjustment.reference,
            performed_by=user,
            source_location=adjustment.location if difference < 0 else None,
            destination_location=adjustment.location if difference >= 0 else None,
            notes=f"Adjustment: system={line.system_quantity}, counted={line.counted_quantity}. "
            f"Reason: {adjustment.reason or 'N/A'}",
        )

    adjustment.status = InventoryAdjustment.Status.VALIDATED
    adjustment.validated_by = user
    adjustment.validated_at = timezone.now()
    adjustment.save()

    logger.info(
        "Adjustment %s validated by %s", adjustment.reference, user.email
    )
    return adjustment


# ---------------------------------------------------------------------------
# Cancel Operations
# ---------------------------------------------------------------------------
@transaction.atomic
def cancel_document(document, user):
    """
    Cancel an inventory document. Only draft/confirmed documents can be cancelled.
    Validated documents cannot be cancelled (they need a reverse operation).
    """
    if document.status == "validated":
        raise InvalidOperationError(
            f"Cannot cancel validated document {document.reference}. "
            f"Create a reverse operation instead."
        )
    if document.status == "cancelled":
        raise InvalidOperationError(
            f"Document {document.reference} is already cancelled."
        )

    document.status = "cancelled"
    document.save()

    logger.info(
        "Document %s cancelled by %s", document.reference, user.email
    )
    return document
