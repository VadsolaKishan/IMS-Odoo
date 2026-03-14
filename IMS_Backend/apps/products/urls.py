"""
Products URL configuration.
"""

from django.urls import path

from . import views

app_name = "products"

urlpatterns = [
    # Categories
    path("categories/", views.CategoryListCreateView.as_view(), name="category-list"),
    path(
        "categories/<int:pk>/",
        views.CategoryDetailView.as_view(),
        name="category-detail",
    ),
    # Units of Measure
    path("uom/", views.UnitOfMeasureListCreateView.as_view(), name="uom-list"),
    path("uom/<int:pk>/", views.UnitOfMeasureDetailView.as_view(), name="uom-detail"),
    # Products
    path("", views.ProductListCreateView.as_view(), name="product-list"),
    path("<int:pk>/", views.ProductDetailView.as_view(), name="product-detail"),
]
