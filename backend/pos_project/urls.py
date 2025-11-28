"""
URL configuration for pos_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# pos_project/urls.py
from django.contrib import admin
from django.urls import path, include
from users.views import CSRFExemptTokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/token/refresh/', CSRFExemptTokenRefreshView.as_view(), name='token_refresh'),

    # Prefiks URL untuk API kita
    path('api/users/', include('users.urls')),
    path('api/products/', include('products.urls')),
    path('api/transactions/', include('transactions.urls')),
]