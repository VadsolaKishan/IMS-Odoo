"""
Product views.
"""

from rest_framework import generics, permissions

from apps.accounts.permissions import IsAdminOrReadOnly, IsInventoryManager

from .filters import ProductFilter
from .models import Category, Product, UnitOfMeasure
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductSerializer,
    UnitOfMeasureSerializer,
)


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


# ---------------------------------------------------------------------------
# Unit of Measure
# ---------------------------------------------------------------------------
class UnitOfMeasureListCreateView(generics.ListCreateAPIView):
    queryset = UnitOfMeasure.objects.all()
    serializer_class = UnitOfMeasureSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["name", "abbreviation"]


class UnitOfMeasureDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UnitOfMeasure.objects.all()
    serializer_class = UnitOfMeasureSerializer
    permission_classes = [IsAdminOrReadOnly]


# ---------------------------------------------------------------------------
# Product
# ---------------------------------------------------------------------------
class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related(
        "category", "unit_of_measure", "created_by"
    ).filter(is_active=True)
    permission_classes = [IsInventoryManager]
    filterset_class = ProductFilter
    search_fields = ["name", "sku", "description"]
    ordering_fields = ["name", "sku", "created_at", "updated_at"]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return ProductListSerializer
        return ProductSerializer


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related(
        "category", "unit_of_measure", "created_by"
    )
    serializer_class = ProductSerializer
    permission_classes = [IsInventoryManager]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
