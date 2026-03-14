"""
Warehouse serializers.
"""

from rest_framework import serializers

from .models import Location, StockRecord, Warehouse


class WarehouseSerializer(serializers.ModelSerializer):
    location_count = serializers.SerializerMethodField()

    class Meta:
        model = Warehouse
        fields = [
            "id",
            "name",
            "code",
            "address",
            "city",
            "state",
            "country",
            "location_count",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_location_count(self, obj):
        return obj.locations.filter(is_active=True).count()


class LocationSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(
        source="warehouse.name", read_only=True
    )
    warehouse_code = serializers.CharField(
        source="warehouse.code", read_only=True
    )

    class Meta:
        model = Location
        fields = [
            "id",
            "warehouse",
            "warehouse_name",
            "warehouse_code",
            "name",
            "code",
            "location_type",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class StockRecordSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    location_code = serializers.CharField(
        source="location.code", read_only=True
    )
    warehouse_name = serializers.CharField(
        source="location.warehouse.name", read_only=True
    )

    class Meta:
        model = StockRecord
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "location",
            "location_code",
            "warehouse_name",
            "quantity",
            "updated_at",
        ]
        read_only_fields = ["id", "updated_at"]
