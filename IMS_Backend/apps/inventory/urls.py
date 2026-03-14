"""
Inventory URL configuration.
"""

from django.urls import path

from . import views

app_name = "inventory"

urlpatterns = [
    # Suppliers
    path("suppliers/", views.SupplierListCreateView.as_view(), name="supplier-list"),
    path(
        "suppliers/<int:pk>/",
        views.SupplierDetailView.as_view(),
        name="supplier-detail",
    ),
    # ---- Receipts ----
    path("receipts/", views.ReceiptListCreateView.as_view(), name="receipt-list"),
    path(
        "receipts/<int:pk>/",
        views.ReceiptDetailView.as_view(),
        name="receipt-detail",
    ),
    path(
        "receipts/<int:receipt_id>/lines/",
        views.ReceiptLineCreateView.as_view(),
        name="receipt-line-create",
    ),
    path(
        "receipts/<int:pk>/validate/",
        views.ReceiptValidateView.as_view(),
        name="receipt-validate",
    ),
    path(
        "receipts/<int:pk>/cancel/",
        views.ReceiptCancelView.as_view(),
        name="receipt-cancel",
    ),
    # ---- Delivery Orders ----
    path(
        "deliveries/",
        views.DeliveryOrderListCreateView.as_view(),
        name="delivery-list",
    ),
    path(
        "deliveries/<int:pk>/",
        views.DeliveryOrderDetailView.as_view(),
        name="delivery-detail",
    ),
    path(
        "deliveries/<int:delivery_id>/lines/",
        views.DeliveryOrderLineCreateView.as_view(),
        name="delivery-line-create",
    ),
    path(
        "deliveries/<int:pk>/validate/",
        views.DeliveryOrderValidateView.as_view(),
        name="delivery-validate",
    ),
    path(
        "deliveries/<int:pk>/cancel/",
        views.DeliveryOrderCancelView.as_view(),
        name="delivery-cancel",
    ),
    # ---- Internal Transfers ----
    path(
        "transfers/",
        views.InternalTransferListCreateView.as_view(),
        name="transfer-list",
    ),
    path(
        "transfers/<int:pk>/",
        views.InternalTransferDetailView.as_view(),
        name="transfer-detail",
    ),
    path(
        "transfers/<int:transfer_id>/lines/",
        views.InternalTransferLineCreateView.as_view(),
        name="transfer-line-create",
    ),
    path(
        "transfers/<int:pk>/validate/",
        views.InternalTransferValidateView.as_view(),
        name="transfer-validate",
    ),
    path(
        "transfers/<int:pk>/cancel/",
        views.InternalTransferCancelView.as_view(),
        name="transfer-cancel",
    ),
    # ---- Inventory Adjustments ----
    path(
        "adjustments/",
        views.InventoryAdjustmentListCreateView.as_view(),
        name="adjustment-list",
    ),
    path(
        "adjustments/<int:pk>/",
        views.InventoryAdjustmentDetailView.as_view(),
        name="adjustment-detail",
    ),
    path(
        "adjustments/<int:adjustment_id>/lines/",
        views.InventoryAdjustmentLineCreateView.as_view(),
        name="adjustment-line-create",
    ),
    path(
        "adjustments/<int:pk>/validate/",
        views.InventoryAdjustmentValidateView.as_view(),
        name="adjustment-validate",
    ),
    path(
        "adjustments/<int:pk>/cancel/",
        views.InventoryAdjustmentCancelView.as_view(),
        name="adjustment-cancel",
    ),
    # ---- Stock Ledger ----
    path("ledger/", views.StockLedgerListView.as_view(), name="ledger-list"),
    path(
        "ledger/product/<int:product_id>/",
        views.ProductLedgerView.as_view(),
        name="product-ledger",
    ),
]
