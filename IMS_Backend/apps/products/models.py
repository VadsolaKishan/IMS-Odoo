"""
Product models – Category, UnitOfMeasure, Product.
"""

from django.conf import settings
from django.db import models


class Category(models.Model):
    """Product category for classification."""

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class UnitOfMeasure(models.Model):
    """Unit of measure for products (e.g., pcs, kg, liters)."""

    name = models.CharField(max_length=50, unique=True)
    abbreviation = models.CharField(max_length=10, unique=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Unit of Measure"
        verbose_name_plural = "Units of Measure"

    def __str__(self):
        return f"{self.name} ({self.abbreviation})"


class Product(models.Model):
    """Core product model."""

    name = models.CharField(max_length=255, db_index=True)
    sku = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        verbose_name="SKU / Code",
    )
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    unit_of_measure = models.ForeignKey(
        UnitOfMeasure,
        on_delete=models.PROTECT,
        related_name="products",
    )
    initial_stock = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Initial stock quantity at product creation.",
    )
    min_stock_level = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Minimum stock level before alert.",
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_products",
    )
    image = models.ImageField(upload_to="products/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Product"
        verbose_name_plural = "Products"
        indexes = [
            models.Index(fields=["sku"]),
            models.Index(fields=["name"]),
            models.Index(fields=["category"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.sku})"

    @property
    def total_stock(self):
        """Calculate total stock across all locations."""
        from apps.warehouses.models import StockRecord

        result = StockRecord.objects.filter(product=self).aggregate(
            total=models.Sum("quantity")
        )
        return result["total"] or 0
