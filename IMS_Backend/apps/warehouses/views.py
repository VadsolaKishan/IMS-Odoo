"""
Warehouse views.
"""

from rest_framework import generics

from apps.accounts.permissions import IsAdminOrReadOnly, IsWarehouseStaff

from .models import Location, StockRecord, Warehouse
from .serializers import LocationSerializer, StockRecordSerializer, WarehouseSerializer


# ---------------------------------------------------------------------------
# Warehouse
# ---------------------------------------------------------------------------
class WarehouseListCreateView(generics.ListCreateAPIView):
    queryset = Warehouse.objects.filter(is_active=True)
    serializer_class = WarehouseSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ["name", "code", "city"]
    ordering_fields = ["name", "created_at"]


class WarehouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


# ---------------------------------------------------------------------------
# Location
# ---------------------------------------------------------------------------
class LocationListCreateView(generics.ListCreateAPIView):
    serializer_class = LocationSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ["warehouse", "location_type", "is_active"]
    search_fields = ["name", "code"]

    def get_queryset(self):
        qs = Location.objects.select_related("warehouse").filter(is_active=True)
        warehouse_id = self.request.query_params.get("warehouse")
        if warehouse_id:
            qs = qs.filter(warehouse_id=warehouse_id)
        return qs


class LocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Location.objects.select_related("warehouse")
    serializer_class = LocationSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


# ---------------------------------------------------------------------------
# Stock Records
# ---------------------------------------------------------------------------
class StockRecordListView(generics.ListAPIView):
    """View all stock records (per product per location)."""

    serializer_class = StockRecordSerializer
    permission_classes = [IsWarehouseStaff]
    filterset_fields = ["product", "location", "location__warehouse"]
    search_fields = ["product__name", "product__sku"]
    ordering_fields = ["quantity", "updated_at"]

    def get_queryset(self):
        return StockRecord.objects.select_related(
            "product", "location", "location__warehouse"
        ).all()


class ProductStockView(generics.ListAPIView):
    """View stock for a specific product across all locations."""

    serializer_class = StockRecordSerializer
    permission_classes = [IsWarehouseStaff]

    def get_queryset(self):
        product_id = self.kwargs.get("product_id")
        return StockRecord.objects.select_related(
            "product", "location", "location__warehouse"
        ).filter(product_id=product_id)
