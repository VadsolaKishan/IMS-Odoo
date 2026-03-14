"""
Inventory models – Supplier, Receipt, DeliveryOrder, InternalTransfer,
InventoryAdjustment, StockLedger.

Every inventory operation follows the same pattern:
  1. Create a document (draft)
  2. Add lines (products + quantities)
  3. Validate → executes stock changes atomically
"""

from django.conf import settings
from django.db import models


# ---------------------------------------------------------------------------
# Supplier
# ---------------------------------------------------------------------------
class Supplier(models.Model):
    """External supplier for incoming stock."""

    name = models.CharField(max_length=200)
    code = models.CharField(max_length=30, unique=True, db_index=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Supplier"
        verbose_name_plural = "Suppliers"

    def __str__(self):
        return f"{self.name} ({self.code})"


# ---------------------------------------------------------------------------
# Abstract base for inventory documents
# ---------------------------------------------------------------------------
class BaseInventoryDocument(models.Model):
    """Abstract base for all inventory operation documents."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        CONFIRMED = "confirmed", "Confirmed"
        VALIDATED = "validated", "Validated"
        CANCELLED = "cancelled", "Cancelled"

    reference = models.CharField(
        max_length=50, unique=True, db_index=True, editable=False
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="%(class)s_created",
    )
    validated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_validated",
    )
    scheduled_date = models.DateTimeField(null=True, blank=True)
    validated_at = models.DateTimeField(null=True, blank=True)
    image = models.ImageField(upload_to="inventory/docs/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]

    def __str__(self):
        return self.reference


# ---------------------------------------------------------------------------
# Receipt (Incoming Stock)
# ---------------------------------------------------------------------------
class Receipt(BaseInventoryDocument):
    """Incoming stock from a supplier."""

    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name="receipts",
    )
    destination_location = models.ForeignKey(
        "warehouses.Location",
        on_delete=models.PROTECT,
        related_name="incoming_receipts",
    )

    class Meta(BaseInventoryDocument.Meta):
        verbose_name = "Receipt"
        verbose_name_plural = "Receipts"

    def save(self, *args, **kwargs):
        if not self.reference:
            last = Receipt.objects.order_by("-id").first()
            num = (last.id + 1) if last else 1
            self.reference = f"REC-{num:06d}"
        super().save(*args, **kwargs)


class ReceiptLine(models.Model):
    """Line item for a receipt."""

    receipt = models.ForeignKey(
        Receipt, on_delete=models.CASCADE, related_name="lines"
    )
    product = models.ForeignKey(
        "products.Product", on_delete=models.PROTECT, related_name="receipt_lines"
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ["receipt", "product"]
        verbose_name = "Receipt Line"
        verbose_name_plural = "Receipt Lines"

    def __str__(self):
        return f"{self.receipt.reference} – {self.product.sku} x {self.quantity}"


# ---------------------------------------------------------------------------
# Delivery Order (Outgoing Stock)
# ---------------------------------------------------------------------------
class DeliveryOrder(BaseInventoryDocument):
    """Outgoing stock delivery."""

    source_location = models.ForeignKey(
        "warehouses.Location",
        on_delete=models.PROTECT,
        related_name="outgoing_deliveries",
    )
    customer_name = models.CharField(max_length=200, blank=True)
    customer_reference = models.CharField(max_length=100, blank=True)

    class Meta(BaseInventoryDocument.Meta):
        verbose_name = "Delivery Order"
        verbose_name_plural = "Delivery Orders"

    def save(self, *args, **kwargs):
        if not self.reference:
            last = DeliveryOrder.objects.order_by("-id").first()
            num = (last.id + 1) if last else 1
            self.reference = f"DEL-{num:06d}"
        super().save(*args, **kwargs)


class DeliveryOrderLine(models.Model):
    """Line item for a delivery order."""

    delivery_order = models.ForeignKey(
        DeliveryOrder, on_delete=models.CASCADE, related_name="lines"
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT,
        related_name="delivery_lines",
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ["delivery_order", "product"]
        verbose_name = "Delivery Line"
        verbose_name_plural = "Delivery Lines"

    def __str__(self):
        return f"{self.delivery_order.reference} – {self.product.sku} x {self.quantity}"


# ---------------------------------------------------------------------------
# Internal Transfer
# ---------------------------------------------------------------------------
class InternalTransfer(BaseInventoryDocument):
    """Move stock between warehouses or locations."""

    source_location = models.ForeignKey(
        "warehouses.Location",
        on_delete=models.PROTECT,
        related_name="outgoing_transfers",
    )
    destination_location = models.ForeignKey(
        "warehouses.Location",
        on_delete=models.PROTECT,
        related_name="incoming_transfers",
    )

    class Meta(BaseInventoryDocument.Meta):
        verbose_name = "Internal Transfer"
        verbose_name_plural = "Internal Transfers"

    def save(self, *args, **kwargs):
        if not self.reference:
            last = InternalTransfer.objects.order_by("-id").first()
            num = (last.id + 1) if last else 1
            self.reference = f"TRF-{num:06d}"
        super().save(*args, **kwargs)


class InternalTransferLine(models.Model):
    """Line item for an internal transfer."""

    transfer = models.ForeignKey(
        InternalTransfer, on_delete=models.CASCADE, related_name="lines"
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT,
        related_name="transfer_lines",
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ["transfer", "product"]
        verbose_name = "Transfer Line"
        verbose_name_plural = "Transfer Lines"

    def __str__(self):
        return f"{self.transfer.reference} – {self.product.sku} x {self.quantity}"


# ---------------------------------------------------------------------------
# Inventory Adjustment
# ---------------------------------------------------------------------------
class InventoryAdjustment(BaseInventoryDocument):
    """Correct stock based on physical count."""

    location = models.ForeignKey(
        "warehouses.Location",
        on_delete=models.PROTECT,
        related_name="adjustments",
    )
    reason = models.TextField(blank=True, help_text="Reason for the adjustment.")

    class Meta(BaseInventoryDocument.Meta):
        verbose_name = "Inventory Adjustment"
        verbose_name_plural = "Inventory Adjustments"

    def save(self, *args, **kwargs):
        if not self.reference:
            last = InventoryAdjustment.objects.order_by("-id").first()
            num = (last.id + 1) if last else 1
            self.reference = f"ADJ-{num:06d}"
        super().save(*args, **kwargs)


class InventoryAdjustmentLine(models.Model):
    """Line item for an inventory adjustment."""

    adjustment = models.ForeignKey(
        InventoryAdjustment,
        on_delete=models.CASCADE,
        related_name="lines",
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT,
        related_name="adjustment_lines",
    )
    counted_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Physical count quantity.",
    )
    system_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="System quantity at time of count.",
    )

    class Meta:
        unique_together = ["adjustment", "product"]
        verbose_name = "Adjustment Line"
        verbose_name_plural = "Adjustment Lines"

    def __str__(self):
        diff = self.counted_quantity - self.system_quantity
        return f"{self.adjustment.reference} – {self.product.sku} (diff: {diff:+})"

    @property
    def difference(self):
        return self.counted_quantity - self.system_quantity


# ---------------------------------------------------------------------------
# Stock Ledger (Immutable audit trail)
# ---------------------------------------------------------------------------
class StockLedger(models.Model):
    """
    Immutable audit log for every inventory movement.
    Every stock change creates exactly one ledger entry.
    """

    class OperationType(models.TextChoices):
        RECEIPT = "receipt", "Receipt"
        DELIVERY = "delivery", "Delivery"
        TRANSFER_OUT = "transfer_out", "Transfer Out"
        TRANSFER_IN = "transfer_in", "Transfer In"
        ADJUSTMENT = "adjustment", "Adjustment"
        INITIAL = "initial", "Initial Stock"

    product = models.ForeignKey(
        "products.Product",
        on_delete=models.PROTECT,
        related_name="ledger_entries",
    )
    operation_type = models.CharField(
        max_length=20,
        choices=OperationType.choices,
        db_index=True,
    )
    quantity_change = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Positive for incoming, negative for outgoing.",
    )
    quantity_after = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Stock quantity after this operation.",
    )
    source_location = models.ForeignKey(
        "warehouses.Location",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ledger_source",
    )
    destination_location = models.ForeignKey(
        "warehouses.Location",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ledger_destination",
    )
    reference = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Reference to the source document.",
    )
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Stock Ledger Entry"
        verbose_name_plural = "Stock Ledger Entries"
        indexes = [
            models.Index(fields=["product", "timestamp"]),
            models.Index(fields=["operation_type", "timestamp"]),
            models.Index(fields=["reference"]),
        ]

    def __str__(self):
        return (
            f"{self.timestamp:%Y-%m-%d %H:%M} | {self.operation_type} | "
            f"{self.product.sku} | {self.quantity_change:+}"
        )
