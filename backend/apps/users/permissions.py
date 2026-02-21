from rest_framework.permissions import BasePermission
from .models import User


class IsBuyer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.BUYER


class IsSeller(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.SELLER


class IsStoreOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.STORE


class IsRepairShop(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.Role.REPAIR


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == User.Role.ADMIN or request.user.is_staff
        )


class IsSellerOrStoreOrRepair(BasePermission):
    """Can list items (seller, store, repair shop)."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            User.Role.SELLER, User.Role.STORE, User.Role.REPAIR, User.Role.ADMIN
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level: only the owner or admin can modify."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == User.Role.ADMIN or request.user.is_staff:
            return True
        owner = getattr(obj, "user", None) or getattr(obj, "seller", None) or getattr(obj, "owner", None)
        return owner == request.user
