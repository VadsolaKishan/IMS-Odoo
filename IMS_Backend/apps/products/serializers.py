"""
Product serializers.
"""

from rest_framework import serializers

from .models import Category, Product, UnitOfMeasure


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "parent",
            "children",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategorySerializer(children, many=True).data


class UnitOfMeasureSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitOfMeasure
        fields = ["id", "name", "abbreviation"]
        read_only_fields = ["id"]


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    uom_name = serializers.CharField(
        source="unit_of_measure.name", read_only=True
    )
    uom_abbreviation = serializers.CharField(
        source="unit_of_measure.abbreviation", read_only=True
    )
    total_stock = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "description",
            "category",
            "category_name",
            "unit_of_measure",
            "uom_name",
            "uom_abbreviation",
            "initial_stock",
            "min_stock_level",
            "total_stock",
            "image",
            "is_active",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "total_stock",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""

    category_name = serializers.CharField(source="category.name", read_only=True)
    uom_abbreviation = serializers.CharField(
        source="unit_of_measure.abbreviation", read_only=True
    )
    total_stock = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "category_name",
            "uom_abbreviation",
            "total_stock",
            "min_stock_level",
            "image",
            "is_active",
        ]
