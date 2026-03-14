"""
Inventory views – CRUD + Validate/Cancel for all inventory operations.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsInventoryManager, IsWarehouseStaff

from .filters import (
    DeliveryOrderFilter,
    InternalTransferFilter,
    InventoryAdjustmentFilter,
    ReceiptFilter,
    StockLedgerFilter,
)
from .models import (
    DeliveryOrder,
    DeliveryOrderLine,
    InternalTransfer,
    InternalTransferLine,
    InventoryAdjustment,
    InventoryAdjustmentLine,
    Receipt,
    ReceiptLine,
    StockLedger,
    Supplier,
)
from .serializers import (
    DeliveryOrderCreateSerializer,
    DeliveryOrderLineSerializer,
    DeliveryOrderSerializer,
    InternalTransferCreateSerializer,
    InternalTransferLineSerializer,
    InternalTransferSerializer,
    InventoryAdjustmentCreateSerializer,
    InventoryAdjustmentLineSerializer,
    InventoryAdjustmentSerializer,
    ReceiptCreateSerializer,
    ReceiptLineSerializer,
    ReceiptSerializer,
    StockLedgerSerializer,
    SupplierSerializer,
)
from .services import (
    InsufficientStockError,
    InvalidOperationError,
    cancel_document,
    validate_delivery_order,
    validate_internal_transfer,
    validate_inventory_adjustment,
    validate_receipt,
)


# ---------------------------------------------------------------------------
# Supplier
# ---------------------------------------------------------------------------
class SupplierListCreateView(generics.ListCreateAPIView):
    queryset = Supplier.objects.filter(is_active=True)
    serializer_class = SupplierSerializer
    permission_classes = [IsInventoryManager]
    search_fields = ["name", "code", "email"]
    ordering_fields = ["name", "created_at"]


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsInventoryManager]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


# ---------------------------------------------------------------------------
# Receipt
# ---------------------------------------------------------------------------
class ReceiptListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsWarehouseStaff]
    filterset_class = ReceiptFilter
    search_fields = ["reference", "supplier__name"]
    ordering_fields = ["created_at", "scheduled_date"]

    def get_queryset(self):
        return Receipt.objects.select_related(
            "supplier", "destination_location", "created_by", "validated_by"
        ).prefetch_related("lines__product")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ReceiptCreateSerializer
        return ReceiptSerializer


class ReceiptDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsWarehouseStaff]
    serializer_class = ReceiptSerializer

    def get_queryset(self):
        return Receipt.objects.select_related(
            "supplier", "destination_location", "created_by", "validated_by"
        ).prefetch_related("lines__product")


class ReceiptLineCreateView(generics.CreateAPIView):
    """Add a line to an existing receipt."""

    serializer_class = ReceiptLineSerializer
    permission_classes = [IsWarehouseStaff]

    def perform_create(self, serializer):
        receipt = Receipt.objects.get(pk=self.kwargs["receipt_id"])
        if receipt.status not in ("draft", "confirmed"):
            raise InvalidOperationError("Cannot modify a validated/cancelled receipt.")
        serializer.save(receipt=receipt)


class ReceiptValidateView(APIView):
    """Validate a receipt → increase stock."""

    permission_classes = [IsInventoryManager]

    def post(self, request, pk):
        try:
            receipt = validate_receipt(pk, request.user)
            return Response(
                ReceiptSerializer(receipt).data,
                status=status.HTTP_200_OK,
            )
        except Receipt.DoesNotExist:
            return Response(
                {"error": "Receipt not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except (InvalidOperationError, InsufficientStockError) as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ReceiptCancelView(APIView):
    """Cancel a receipt."""

    permission_classes = [IsInventoryManager]

    def post(self, request, pk):
        try:
            receipt = Receipt.objects.get(pk=pk)
            receipt = cancel_document(receipt, request.user)
            return Response(
                ReceiptSerializer(receipt).data,
                status=status.HTTP_200_OK,
            )
        except Receipt.DoesNotExist:
            return Response(
                {"error": "Receipt not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except InvalidOperationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ---------------------------------------------------------------------------
# Delivery Order
# ---------------------------------------------------------------------------
class DeliveryOrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsWarehouseStaff]
    filterset_class = DeliveryOrderFilter
    search_fields = ["reference", "customer_name"]
    ordering_fields = ["created_at", "scheduled_date"]

    def get_queryset(self):
        return DeliveryOrder.objects.select_related(
            "source_location", "created_by", "validated_by"
        ).prefetch_related("lines__product")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return DeliveryOrderCreateSerializer
        return DeliveryOrderSerializer


class DeliveryOrderDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsWarehouseStaff]
    serializer_class = DeliveryOrderSerializer

    def get_queryset(self):
        return DeliveryOrder.objects.select_related(
            "source_location", "created_by", "validated_by"
        ).prefetch_related("lines__product")


class DeliveryOrderLineCreateView(generics.CreateAPIView):
    """Add a line to an existing delivery order."""

    serializer_class = DeliveryOrderLineSerializer
    permission_classes = [IsWarehouseStaff]

    def perform_create(self, serializer):
        delivery = DeliveryOrder.objects.get(pk=self.kwargs["delivery_id"])
        if delivery.status not in ("draft", "confirmed"):
            raise InvalidOperationError(
                "Cannot modify a validated/cancelled delivery order."
            )
        serializer.save(delivery_order=delivery)


class DeliveryOrderValidateView(APIView):
    """Validate a delivery order → decrease stock."""

    permission_classes = [IsInventoryManager]

    def post(self, request, pk):
        try:
            delivery = validate_delivery_order(pk, request.user)
            return Response(
                DeliveryOrderSerializer(delivery).data,
                status=status.HTTP_200_OK,
            )
        except DeliveryOrder.DoesNotExist:
            return Response(
                {"error": "Delivery order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except (InvalidOperationError, InsufficientStockError) as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class DeliveryOrderCancelView(APIView):
    """Cancel a delivery order."""

    permission_classes = [IsInventoryManager]

    def post(self, request, pk):
        try:
            delivery = DeliveryOrder.objects.get(pk=pk)
            delivery = cancel_document(delivery, request.user)
            return Response(
                DeliveryOrderSerializer(delivery).data,
                status=status.HTTP_200_OK,
            )
        except DeliveryOrder.DoesNotExist:
            return Response(
                {"error": "Delivery order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except InvalidOperationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ---------------------------------------------------------------------------
# Internal Transfer
# ---------------------------------------------------------------------------
class InternalTransferListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsWarehouseStaff]
    filterset_class = InternalTransferFilter
    search_fields = ["reference"]
    ordering_fields = ["created_at", "scheduled_date"]

    def get_queryset(self):
        return InternalTransfer.objects.select_related(
            "source_location",
            "destination_location",
            "created_by",
            "validated_by",
        ).prefetch_related("lines__product")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return InternalTransferCreateSerializer
        return InternalTransferSerializer


class InternalTransferDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsWarehouseStaff]
    serializer_class = InternalTransferSerializer

    def get_queryset(self):
        return InternalTransfer.objects.select_related(
            "source_location",
            "destination_location",
            "created_by",
            "validated_by",
        ).prefetch_related("lines__product")


class InternalTransferLineCreateView(generics.CreateAPIView):
    """Add a line to an existing transfer."""

    serializer_class = InternalTransferLineSerializer
    permission_classes = [IsWarehouseStaff]

    def perform_create(self, serializer):
        transfer = InternalTransfer.objects.get(pk=self.kwargs["transfer_id"])
        if transfer.status not in ("draft", "confirmed"):
            raise InvalidOperationError(
                "Cannot modify a validated/cancelled transfer."
            )
        serializer.save(transfer=transfer)


class InternalTransferValidateView(APIView):
    """Validate a transfer → move stock."""

    permission_classes = [IsInventoryManager]

    def post(self, request, pk):
        try:
            transfer = validate_internal_transfer(pk, request.user)
            return Response(
                InternalTransferSerializer(transfer).data,
                status=status.HTTP_200_OK,
            )
        except InternalTransfer.DoesNotExist:
            return Response(
                {"error": "Transfer not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except (InvalidOperationError, InsufficientStockError) as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class InternalTransferCancelView(APIView):
    """Cancel a transfer."""

    permission_classes = [IsInventoryManager]

    def post(self, request, pk):
        try:
            transfer = InternalTransfer.objects.get(pk=pk)
            transfer = cancel_document(transfer, request.user)
            return Response(
                InternalTransferSerializer(transfer).data,
                status=status.HTTP_200_OK,
            )
        except InternalTransfer.DoesNotExist:
            return Response(
                {"error": "Transfer not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except InvalidOperationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ---------------------------------------------------------------------------
# Inventory Adjustment
# ---------------------------------------------------------------------------
class InventoryAdjustmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsInventoryManager]
    filterset_class = InventoryAdjustmentFilter
    search_fields = ["reference", "reason"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        return InventoryAdjustment.objects.select_related(
            "location", "created_by", "validated_by"
        ).prefetch_related("lines__product")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return InventoryAdjustmentCreateSerializer
        return InventoryAdjustmentSerializer


class InventoryAdjustmentDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsInventoryManager]
    serializer_class = InventoryAdjustmentSerializer

    def get_queryset(self):
        return InventoryAdjustment.objects.select_related(
            "location", "created_by", "validated_by"
        ).prefetch_related("lines__product")


class InventoryAdjustmentLineCreateView(generics.CreateAPIView):
    """Add a line to an existing adjustment."""

    serializer_class = InventoryAdjustmentLineSerializer
    permission_classes = [IsInventoryManager]

    def perform_create(self, serializer):
        adjustment = InventoryAdjustment.objects.get(
            pk=self.kwargs["adjustment_id"]
        )
        if adjustment.status not in ("draft", "confirmed"):
            raise InvalidOperationError(
                "Cannot modify a validated/cancelled adjustment."
            )
        serializer.save(adjustment=adjustment)


class InventoryAdjustmentValidateView(APIView):
    """Validate an adjustment → update stock to counted quantities."""

    permission_classes = [IsInventoryManager]

    def post(self, request, pk):
        try:
            adjustment = validate_inventory_adjustment(pk, request.user)
            return Response(
                InventoryAdjustmentSerializer(adjustment).data,
                status=status.HTTP_200_OK,
            )
        except InventoryAdjustment.DoesNotExist:
            return Response(
                {"error": "Adjustment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except (InvalidOperationError, InsufficientStockError) as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class InventoryAdjustmentCancelView(APIView):
    """Cancel an adjustment."""

    permission_classes = [IsInventoryManager]

    def post(self, request, pk):
        try:
            adjustment = InventoryAdjustment.objects.get(pk=pk)
            adjustment = cancel_document(adjustment, request.user)
            return Response(
                InventoryAdjustmentSerializer(adjustment).data,
                status=status.HTTP_200_OK,
            )
        except InventoryAdjustment.DoesNotExist:
            return Response(
                {"error": "Adjustment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except InvalidOperationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ---------------------------------------------------------------------------
# Stock Ledger (Read-only)
# ---------------------------------------------------------------------------
class StockLedgerListView(generics.ListAPIView):
    """Read-only view of the stock ledger (audit trail)."""

    serializer_class = StockLedgerSerializer
    permission_classes = [IsWarehouseStaff]
    filterset_class = StockLedgerFilter
    search_fields = ["reference", "product__name", "product__sku"]
    ordering_fields = ["timestamp", "quantity_change"]

    def get_queryset(self):
        return StockLedger.objects.select_related(
            "product",
            "source_location",
            "destination_location",
            "performed_by",
        ).all()


class ProductLedgerView(generics.ListAPIView):
    """Stock ledger filtered by product."""

    serializer_class = StockLedgerSerializer
    permission_classes = [IsWarehouseStaff]
    filterset_class = StockLedgerFilter

    def get_queryset(self):
        product_id = self.kwargs.get("product_id")
        return StockLedger.objects.select_related(
            "product",
            "source_location",
            "destination_location",
            "performed_by",
        ).filter(product_id=product_id)
