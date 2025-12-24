# backend/users/permissions.py
from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """
    Hanya mengizinkan akses jika user memiliki role 'admin'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsAdminOrGuest(permissions.BasePermission):
    """
    Mengizinkan Admin dan Guest (untuk melihat laporan/produk), tapi Kasir dilarang.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'guest']