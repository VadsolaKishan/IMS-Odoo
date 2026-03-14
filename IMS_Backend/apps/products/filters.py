"""
Product filters.
"""

import django_filters

from .models import Product


class ProductFilter(django_filters.FilterSet):
    """Advanced filtering for products."""

    name = django_filters.CharFilter(lookup_expr="icontains")
    sku = django_filters.CharFilter(lookup_expr="icontains")
    category = django_filters.NumberFilter(field_name="category__id")
    category_name = django_filters.CharFilter(
        field_name="category__name", lookup_expr="icontains"
    )
    min_stock = django_filters.NumberFilter(
        field_name="min_stock_level", lookup_expr="gte"
    )
    is_active = django_filters.BooleanFilter()
    created_after = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="gte"
    )
    created_before = django_filters.DateTimeFilter(
        field_name="created_at", lookup_expr="lte"
    )

    class Meta:
        model = Product
        fields = [
            "name",
            "sku",
            "category",
            "category_name",
            "is_active",
        ]
