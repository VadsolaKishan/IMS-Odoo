"""
Warehouse admin configuration.
"""

from django.contrib import admin

from .models import Location, StockRecord, Warehouse


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "city", "country", "is_active", "created_at"]
    list_filter = ["is_active", "country"]
    search_fields = ["name", "code", "city"]
    ordering = ["name"]


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "name",
        "warehouse",
        "location_type",
        "is_active",
    ]
    list_filter = ["warehouse", "location_type", "is_active"]
    search_fields = ["name", "code"]
    ordering = ["warehouse", "code"]


@admin.register(StockRecord)
class StockRecordAdmin(admin.ModelAdmin):
    list_display = ["product", "location", "quantity", "updated_at"]
    list_filter = ["location__warehouse"]
    search_fields = ["product__name", "product__sku"]
    readonly_fields = ["updated_at"]
