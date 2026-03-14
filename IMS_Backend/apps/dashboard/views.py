"""
Dashboard views – Aggregated statistics for the inventory system.
"""

from django.conf import settings
from django.db.models import Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.inventory.models import (
    DeliveryOrder,
    InternalTransfer,
    Receipt,
    StockLedger,
)
from apps.products.models import Product
from apps.warehouses.models import StockRecord


def _stock_for_product(product_id):
    """Get total stock for a specific product."""
    result = StockRecord.objects.filter(product_id=product_id).aggregate(
        total=Sum("quantity")
    )
    return result["total"] or 0


class DashboardOverviewView(APIView):
    """
    Return key inventory metrics:
      - total products in stock
      - low stock items
      - out of stock items
      - pending receipts
      - pending deliveries
      - scheduled transfers
      - recent activity
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        low_stock_threshold = getattr(settings, "LOW_STOCK_THRESHOLD", 10)

        # ---- Products ----
        total_products = Product.objects.filter(is_active=True).count()

        # Aggregate stock per product
        stock_summary = (
            StockRecord.objects.values("product")
            .annotate(total_qty=Sum("quantity"))
        )

        stock_by_product = {
            item["product"]: item["total_qty"] or 0
            for item in stock_summary
        }

        all_active_products = Product.objects.filter(is_active=True)

        out_of_stock_count = 0
        low_stock_count = 0
        in_stock_count = 0

        for product in all_active_products:
            total_qty = stock_by_product.get(product.id, 0)
            if total_qty <= 0:
                out_of_stock_count += 1
            elif (
                total_qty <= product.min_stock_level
                or total_qty <= low_stock_threshold
            ):
                low_stock_count += 1
            else:
                in_stock_count += 1

        # ---- Pending Operations ----
        pending_receipts = Receipt.objects.filter(
            status__in=["draft", "confirmed"]
        ).count()

        pending_deliveries = DeliveryOrder.objects.filter(
            status__in=["draft", "confirmed"]
        ).count()

        scheduled_transfers = InternalTransfer.objects.filter(
            status__in=["draft", "confirmed"]
        ).count()

        # ---- Recent Activity (last 7 days) ----
        seven_days_ago = timezone.now() - timezone.timedelta(days=7)
        recent_ledger_count = StockLedger.objects.filter(
            timestamp__gte=seven_days_ago
        ).count()

        # ---- Today's operations ----
        today_start = timezone.now().replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        today_receipts = Receipt.objects.filter(
            validated_at__gte=today_start
        ).count()
        today_deliveries = DeliveryOrder.objects.filter(
            validated_at__gte=today_start
        ).count()

        return Response(
            {
                "products": {
                    "total": total_products,
                    "in_stock": in_stock_count,
                    "low_stock": low_stock_count,
                    "out_of_stock": out_of_stock_count,
                },
                "operations": {
                    "pending_receipts": pending_receipts,
                    "pending_deliveries": pending_deliveries,
                    "scheduled_transfers": scheduled_transfers,
                },
                "today": {
                    "receipts_validated": today_receipts,
                    "deliveries_validated": today_deliveries,
                },
                "activity": {
                    "movements_last_7_days": recent_ledger_count,
                },
            }
        )


class LowStockItemsView(APIView):
    """Return list of products with stock below threshold."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        low_stock_threshold = getattr(settings, "LOW_STOCK_THRESHOLD", 10)

        # Get stock aggregated per product
        stock_summary = dict(
            StockRecord.objects.values_list("product")
            .annotate(total_qty=Sum("quantity"))
            .values_list("product", "total_qty")
        )

        items = []
        all_products = Product.objects.filter(is_active=True).select_related(
            "category"
        )
        for product in all_products:
            total = stock_summary.get(product.id, 0) or 0
            if total > 0 and (
                total <= product.min_stock_level
                or total <= low_stock_threshold
            ):
                items.append(
                    {
                        "id": product.id,
                        "name": product.name,
                        "sku": product.sku,
                        "category": product.category.name,
                        "current_stock": float(total),
                        "min_stock_level": float(product.min_stock_level),
                    }
                )

        items.sort(key=lambda x: x["current_stock"])
        return Response({"count": len(items), "items": items})


class OutOfStockItemsView(APIView):
    """Return list of products with zero stock."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Products with positive stock
        product_ids_with_stock = set(
            StockRecord.objects.values("product")
            .annotate(total_qty=Sum("quantity"))
            .filter(total_qty__gt=0)
            .values_list("product", flat=True)
        )

        out_of_stock = (
            Product.objects.filter(is_active=True)
            .exclude(id__in=product_ids_with_stock)
            .select_related("category")
        )

        items = [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "category": p.category.name,
            }
            for p in out_of_stock
        ]

        return Response({"count": len(items), "items": items})
