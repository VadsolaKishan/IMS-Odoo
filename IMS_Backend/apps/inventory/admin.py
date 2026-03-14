"""
Inventory admin configuration.
"""

from django.contrib import admin

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


# ---------------------------------------------------------------------------
# Supplier
# ---------------------------------------------------------------------------
@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "email", "phone", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name", "code", "email"]


# ---------------------------------------------------------------------------
# Receipt
# ---------------------------------------------------------------------------
class ReceiptLineInline(admin.TabularInline):
    model = ReceiptLine
    extra = 1
    raw_id_fields = ["product"]


@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = [
        "reference",
        "supplier",
        "destination_location",
        "status",
        "created_by",
        "created_at",
    ]
    list_filter = ["status", "created_at"]
    search_fields = ["reference", "supplier__name"]
    readonly_fields = ["reference", "validated_by", "validated_at"]
    inlines = [ReceiptLineInline]


# ---------------------------------------------------------------------------
# Delivery Order
# ---------------------------------------------------------------------------
class DeliveryOrderLineInline(admin.TabularInline):
    model = DeliveryOrderLine
    extra = 1
    raw_id_fields = ["product"]


@admin.register(DeliveryOrder)
class DeliveryOrderAdmin(admin.ModelAdmin):
    list_display = [
        "reference",
        "source_location",
        "customer_name",
        "status",
        "created_by",
        "created_at",
    ]
    list_filter = ["status", "created_at"]
    search_fields = ["reference", "customer_name"]
    readonly_fields = ["reference", "validated_by", "validated_at"]
    inlines = [DeliveryOrderLineInline]


# ---------------------------------------------------------------------------
# Internal Transfer
# ---------------------------------------------------------------------------
class InternalTransferLineInline(admin.TabularInline):
    model = InternalTransferLine
    extra = 1
    raw_id_fields = ["product"]


@admin.register(InternalTransfer)
class InternalTransferAdmin(admin.ModelAdmin):
    list_display = [
        "reference",
        "source_location",
        "destination_location",
        "status",
        "created_by",
        "created_at",
    ]
    list_filter = ["status", "created_at"]
    search_fields = ["reference"]
    readonly_fields = ["reference", "validated_by", "validated_at"]
    inlines = [InternalTransferLineInline]


# ---------------------------------------------------------------------------
# Inventory Adjustment
# ---------------------------------------------------------------------------
class InventoryAdjustmentLineInline(admin.TabularInline):
    model = InventoryAdjustmentLine
    extra = 1
    raw_id_fields = ["product"]


@admin.register(InventoryAdjustment)
class InventoryAdjustmentAdmin(admin.ModelAdmin):
    list_display = [
        "reference",
        "location",
        "status",
        "reason",
        "created_by",
        "created_at",
    ]
    list_filter = ["status", "created_at"]
    search_fields = ["reference", "reason"]
    readonly_fields = ["reference", "validated_by", "validated_at"]
    inlines = [InventoryAdjustmentLineInline]


# ---------------------------------------------------------------------------
# Stock Ledger
# ---------------------------------------------------------------------------
@admin.register(StockLedger)
class StockLedgerAdmin(admin.ModelAdmin):
    list_display = [
        "timestamp",
        "product",
        "operation_type",
        "quantity_change",
        "quantity_after",
        "reference",
        "performed_by",
    ]
    list_filter = ["operation_type", "timestamp"]
    search_fields = ["product__name", "product__sku", "reference"]
    readonly_fields = [
        "product",
        "operation_type",
        "quantity_change",
        "quantity_after",
        "source_location",
        "destination_location",
        "reference",
        "performed_by",
        "timestamp",
        "notes",
    ]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
