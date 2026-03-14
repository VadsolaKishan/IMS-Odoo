"""
Warehouses URL configuration.
"""

from django.urls import path

from . import views

app_name = "warehouses"

urlpatterns = [
    # Warehouses
    path("", views.WarehouseListCreateView.as_view(), name="warehouse-list"),
    path("<int:pk>/", views.WarehouseDetailView.as_view(), name="warehouse-detail"),
    # Locations
    path("locations/", views.LocationListCreateView.as_view(), name="location-list"),
    path(
        "locations/<int:pk>/",
        views.LocationDetailView.as_view(),
        name="location-detail",
    ),
    # Stock Records
    path("stock/", views.StockRecordListView.as_view(), name="stock-list"),
    path(
        "stock/product/<int:product_id>/",
        views.ProductStockView.as_view(),
        name="product-stock",
    ),
]
