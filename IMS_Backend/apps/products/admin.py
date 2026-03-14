"""
Products admin configuration.
"""

from django.contrib import admin

from .models import Category, Product, UnitOfMeasure


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "parent", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name"]
    ordering = ["name"]


@admin.register(UnitOfMeasure)
class UnitOfMeasureAdmin(admin.ModelAdmin):
    list_display = ["name", "abbreviation"]
    search_fields = ["name", "abbreviation"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "sku",
        "category",
        "unit_of_measure",
        "initial_stock",
        "min_stock_level",
        "is_active",
        "created_at",
    ]
    list_filter = ["category", "is_active", "unit_of_measure"]
    search_fields = ["name", "sku", "description"]
    ordering = ["-created_at"]
    readonly_fields = ["created_at", "updated_at"]
