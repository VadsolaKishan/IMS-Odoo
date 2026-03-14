"""
Custom permissions for role-based access control.
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to Admin users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_superuser)
        )


class IsInventoryManager(BasePermission):
    """Allow access to Inventory Manager or Admin."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("admin", "inventory_manager")
        )


class IsWarehouseStaff(BasePermission):
    """Allow access to Warehouse Staff, Inventory Manager, or Admin."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role
            in ("admin", "inventory_manager", "warehouse_staff")
        )


class IsAdminOrReadOnly(BasePermission):
    """Admin can write; others can only read."""

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_superuser)
        )


class IsInventoryManagerOrReadOnly(BasePermission):
    """Inventory Manager or Admin can write; others can only read."""

    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("admin", "inventory_manager")
        )
