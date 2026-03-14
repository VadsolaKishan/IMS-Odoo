"""
Dashboard URL configuration.
"""

from django.urls import path

from . import views

app_name = "dashboard"

urlpatterns = [
    path("overview/", views.DashboardOverviewView.as_view(), name="overview"),
    path("low-stock/", views.LowStockItemsView.as_view(), name="low-stock"),
    path("out-of-stock/", views.OutOfStockItemsView.as_view(), name="out-of-stock"),
]
