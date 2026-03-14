"""
Inventory filters.
"""

import django_filters

from .models import (
    DeliveryOrder,
    InternalTransfer,
    InventoryAdjustment,
    Receipt,
    StockLedger,
)


class ReceiptFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Receipt.Status.choices)
    supplier = django_filters.NumberFilter(field_name="supplier__id")
    warehouse = django_filters.NumberFilter(
        field_name="destination_location__warehouse__id"
    )
    created_after = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="gte"
    )
    created_before = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="lte"
    )

    class Meta:
        model = Receipt
        fields = ["status", "supplier", "warehouse"]


class DeliveryOrderFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=DeliveryOrder.Status.choices)
    warehouse = django_filters.NumberFilter(
        field_name="source_location__warehouse__id"
    )
    created_after = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="gte"
    )
    created_before = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="lte"
    )

    class Meta:
        model = DeliveryOrder
        fields = ["status", "warehouse"]


class InternalTransferFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=InternalTransfer.Status.choices)
    source_warehouse = django_filters.NumberFilter(
        field_name="source_location__warehouse__id"
    )
    dest_warehouse = django_filters.NumberFilter(
        field_name="destination_location__warehouse__id"
    )
    created_after = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="gte"
    )
    created_before = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="lte"
    )

    class Meta:
        model = InternalTransfer
        fields = ["status", "source_warehouse", "dest_warehouse"]


class InventoryAdjustmentFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(
        choices=InventoryAdjustment.Status.choices
    )
    warehouse = django_filters.NumberFilter(
        field_name="location__warehouse__id"
    )
    created_after = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="gte"
    )
    created_before = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="lte"
    )

    class Meta:
        model = InventoryAdjustment
        fields = ["status", "warehouse"]


class StockLedgerFilter(django_filters.FilterSet):
    product = django_filters.NumberFilter(field_name="product__id")
    product_category = django_filters.NumberFilter(
        field_name="product__category__id"
    )
    operation_type = django_filters.ChoiceFilter(
        choices=StockLedger.OperationType.choices
    )
    warehouse = django_filters.NumberFilter(
        field_name="destination_location__warehouse__id"
    )
    after = django_filters.DateTimeFilter(
        field_name="timestamp", lookup_expr="gte"
    )
    before = django_filters.DateTimeFilter(
        field_name="timestamp", lookup_expr="lte"
    )

    class Meta:
        model = StockLedger
        fields = ["product", "operation_type", "warehouse"]
