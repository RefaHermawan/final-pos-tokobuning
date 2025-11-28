# users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, UserProfileView, GetCSRFToken

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('profil/', UserProfileView.as_view(), name='user-profil'), # Tambahkan URL ini
    path('csrf-cookie/', GetCSRFToken.as_view(), name='csrf-cookie'),
    path('', include(router.urls)),
]