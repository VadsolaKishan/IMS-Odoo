"""
Inventory serializers – Documents, Lines, StockLedger.
"""

from rest_framework import serializers

from apps.accounts.serializers import UserSerializer

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
class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "code",
            "email",
            "phone",
            "address",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


# ---------------------------------------------------------------------------
# Receipt
# ---------------------------------------------------------------------------
class ReceiptLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)

    class Meta:
        model = ReceiptLine
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "product_image",
            "quantity",
        ]
        read_only_fields = ["id"]


class ReceiptSerializer(serializers.ModelSerializer):
    lines = ReceiptLineSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(
        source="supplier.name", read_only=True
    )
    destination_location_name = serializers.CharField(
        source="destination_location.__str__", read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    validated_by_name = serializers.CharField(
        source="validated_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = Receipt
        fields = [
            "id",
            "reference",
            "status",
            "supplier",
            "supplier_name",
            "destination_location",
            "destination_location_name",
            "notes",
            "scheduled_date",
            "lines",
            "created_by",
            "created_by_name",
            "validated_by",
            "validated_by_name",
            "validated_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "reference",
            "status",
            "created_by",
            "validated_by",
            "validated_at",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class ReceiptCreateSerializer(serializers.ModelSerializer):
    """Create receipt with lines in a single request."""

    lines = ReceiptLineSerializer(many=True)

    class Meta:
        model = Receipt
        fields = [
            "supplier",
            "destination_location",
            "notes",
            "scheduled_date",
            "lines",
        ]

    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        validated_data["created_by"] = self.context["request"].user
        receipt = Receipt.objects.create(**validated_data)
        for line_data in lines_data:
            ReceiptLine.objects.create(receipt=receipt, **line_data)
        return receipt


# ---------------------------------------------------------------------------
# Delivery Order
# ---------------------------------------------------------------------------
class DeliveryOrderLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = DeliveryOrderLine
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "quantity",
        ]
        read_only_fields = ["id"]


class DeliveryOrderSerializer(serializers.ModelSerializer):
    lines = DeliveryOrderLineSerializer(many=True, read_only=True)
    source_location_name = serializers.CharField(
        source="source_location.__str__", read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    validated_by_name = serializers.CharField(
        source="validated_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = DeliveryOrder
        fields = [
            "id",
            "reference",
            "status",
            "source_location",
            "source_location_name",
            "customer_name",
            "customer_reference",
            "notes",
            "scheduled_date",
            "lines",
            "created_by",
            "created_by_name",
            "validated_by",
            "validated_by_name",
            "validated_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "reference",
            "status",
            "created_by",
            "validated_by",
            "validated_at",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class DeliveryOrderCreateSerializer(serializers.ModelSerializer):
    """Create delivery order with lines in a single request."""

    lines = DeliveryOrderLineSerializer(many=True)

    class Meta:
        model = DeliveryOrder
        fields = [
            "source_location",
            "customer_name",
            "customer_reference",
            "notes",
            "scheduled_date",
            "lines",
        ]

    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        validated_data["created_by"] = self.context["request"].user
        delivery = DeliveryOrder.objects.create(**validated_data)
        for line_data in lines_data:
            DeliveryOrderLine.objects.create(delivery_order=delivery, **line_data)
        return delivery


# ---------------------------------------------------------------------------
# Internal Transfer
# ---------------------------------------------------------------------------
class InternalTransferLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = InternalTransferLine
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "quantity",
        ]
        read_only_fields = ["id"]


class InternalTransferSerializer(serializers.ModelSerializer):
    lines = InternalTransferLineSerializer(many=True, read_only=True)
    source_location_name = serializers.CharField(
        source="source_location.__str__", read_only=True
    )
    destination_location_name = serializers.CharField(
        source="destination_location.__str__", read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    validated_by_name = serializers.CharField(
        source="validated_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = InternalTransfer
        fields = [
            "id",
            "reference",
            "status",
            "source_location",
            "source_location_name",
            "destination_location",
            "destination_location_name",
            "notes",
            "scheduled_date",
            "lines",
            "created_by",
            "created_by_name",
            "validated_by",
            "validated_by_name",
            "validated_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "reference",
            "status",
            "created_by",
            "validated_by",
            "validated_at",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        if attrs.get("source_location") == attrs.get("destination_location"):
            raise serializers.ValidationError(
                "Source and destination locations cannot be the same."
            )
        return attrs

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class InternalTransferCreateSerializer(serializers.ModelSerializer):
    """Create transfer with lines in a single request."""

    lines = InternalTransferLineSerializer(many=True)

    class Meta:
        model = InternalTransfer
        fields = [
            "source_location",
            "destination_location",
            "notes",
            "scheduled_date",
            "lines",
        ]

    def validate(self, attrs):
        if attrs.get("source_location") == attrs.get("destination_location"):
            raise serializers.ValidationError(
                "Source and destination locations cannot be the same."
            )
        return attrs

    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        validated_data["created_by"] = self.context["request"].user
        transfer = InternalTransfer.objects.create(**validated_data)
        for line_data in lines_data:
            InternalTransferLine.objects.create(transfer=transfer, **line_data)
        return transfer


# ---------------------------------------------------------------------------
# Inventory Adjustment
# ---------------------------------------------------------------------------
class InventoryAdjustmentLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    difference = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = InventoryAdjustmentLine
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "counted_quantity",
            "system_quantity",
            "difference",
        ]
        read_only_fields = ["id", "system_quantity", "difference"]


class InventoryAdjustmentSerializer(serializers.ModelSerializer):
    lines = InventoryAdjustmentLineSerializer(many=True, read_only=True)
    location_name = serializers.CharField(
        source="location.__str__", read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    validated_by_name = serializers.CharField(
        source="validated_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = InventoryAdjustment
        fields = [
            "id",
            "reference",
            "status",
            "location",
            "location_name",
            "reason",
            "notes",
            "lines",
            "created_by",
            "created_by_name",
            "validated_by",
            "validated_by_name",
            "validated_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "reference",
            "status",
            "created_by",
            "validated_by",
            "validated_at",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class InventoryAdjustmentCreateSerializer(serializers.ModelSerializer):
    """Create adjustment with lines in a single request."""

    lines = InventoryAdjustmentLineSerializer(many=True)

    class Meta:
        model = InventoryAdjustment
        fields = ["location", "reason", "notes", "lines"]

    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        validated_data["created_by"] = self.context["request"].user
        adjustment = InventoryAdjustment.objects.create(**validated_data)
        for line_data in lines_data:
            InventoryAdjustmentLine.objects.create(
                adjustment=adjustment, **line_data
            )
        return adjustment


# ---------------------------------------------------------------------------
# Stock Ledger
# ---------------------------------------------------------------------------
class StockLedgerSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    source_location_name = serializers.SerializerMethodField()
    destination_location_name = serializers.SerializerMethodField()
    performed_by_name = serializers.CharField(
        source="performed_by.get_full_name", read_only=True, default=None
    )

    class Meta:
        model = StockLedger
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "operation_type",
            "quantity_change",
            "quantity_after",
            "source_location",
            "source_location_name",
            "destination_location",
            "destination_location_name",
            "reference",
            "performed_by",
            "performed_by_name",
            "timestamp",
            "notes",
        ]

    def get_source_location_name(self, obj):
        return str(obj.source_location) if obj.source_location else None

    def get_destination_location_name(self, obj):
        return str(obj.destination_location) if obj.destination_location else None
