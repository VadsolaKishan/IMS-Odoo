"""
Warehouse models – Warehouse, Location, StockRecord.
"""

from django.db import models

from apps.products.models import Product


class Warehouse(models.Model):
    """Physical warehouse."""

    name = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=20, unique=True, db_index=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default="India")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Warehouse"
        verbose_name_plural = "Warehouses"

    def __str__(self):
        return f"{self.name} ({self.code})"


class Location(models.Model):
    """Specific location inside a warehouse (e.g., shelf, bin, rack)."""

    class LocationType(models.TextChoices):
        SHELF = "shelf", "Shelf"
        BIN = "bin", "Bin"
        RACK = "rack", "Rack"
        ZONE = "zone", "Zone"
        DOCK = "dock", "Dock"
        OTHER = "other", "Other"

    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="locations",
    )
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=30, db_index=True)
    location_type = models.CharField(
        max_length=20,
        choices=LocationType.choices,
        default=LocationType.SHELF,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["warehouse", "name"]
        unique_together = ["warehouse", "code"]
        verbose_name = "Location"
        verbose_name_plural = "Locations"

    def __str__(self):
        return f"{self.warehouse.code}/{self.code}"


class StockRecord(models.Model):
    """
    Current stock of a product at a specific location.
    This is the source of truth for stock levels.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="stock_records",
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.CASCADE,
        related_name="stock_records",
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["product", "location"]
        verbose_name = "Stock Record"
        verbose_name_plural = "Stock Records"
        indexes = [
            models.Index(fields=["product", "location"]),
            models.Index(fields=["quantity"]),
        ]

    def __str__(self):
        return f"{self.product.sku} @ {self.location}: {self.quantity}"
