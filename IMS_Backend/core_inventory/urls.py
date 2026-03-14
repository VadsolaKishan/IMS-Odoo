"""
CoreInventory – Root URL Configuration
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    # API v1
    path("api/v1/auth/", include("apps.accounts.urls", namespace="accounts")),
    path("api/v1/products/", include("apps.products.urls", namespace="products")),
    path("api/v1/warehouses/", include("apps.warehouses.urls", namespace="warehouses")),
    path("api/v1/inventory/", include("apps.inventory.urls", namespace="inventory")),
    path("api/v1/dashboard/", include("apps.dashboard.urls", namespace="dashboard")),
    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

# Admin site customization
admin.site.site_header = "CoreInventory Administration"
admin.site.site_title = "CoreInventory Admin"
admin.site.index_title = "Inventory Management"
