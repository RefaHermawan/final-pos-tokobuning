# users/views.py

from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer, UserUpdateSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count
from transactions.models import Transaksi
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.views import TokenRefreshView
from django.middleware.csrf import get_token

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint yang memungkinkan pengguna untuk dilihat atau diedit.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer

    def get_serializer_class(self):
            # Jika aksi adalah 'update' atau 'partial_update', gunakan serializer edit
            if self.action in ['update', 'partial_update']:
                return UserUpdateSerializer
            # Untuk semua aksi lain (seperti 'create' atau 'list'), gunakan serializer standar
            return UserSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        now = timezone.now()

        # Serialisasi data user dasar
        user_data = UserSerializer(user).data

        # Hitung statistik aktivitas untuk bulan ini
        transactions_this_month = Transaksi.objects.filter(
            kasir=user,
            created_at__year=now.year,
            created_at__month=now.month
        )

        stats = transactions_this_month.aggregate(
            total_penjualan=Sum('total_setelah_diskon'),
            jumlah_transaksi=Count('id')
        )

        # Gabungkan semua data
        response_data = {
            'user': user_data,
            'stats': {
                'total_penjualan_bulan_ini': stats['total_penjualan'] or 0,
                'jumlah_transaksi_bulan_ini': stats['jumlah_transaksi'] or 0,
            }
        }
        return Response(response_data)
    
@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        # Ambil token secara eksplisit
        csrf_token = get_token(request) 
        # Kirim token di dalam body response JSON
        return Response({ 'success': 'CSRF cookie set', 'csrfToken': csrf_token })
    
class CSRFExemptTokenRefreshView(TokenRefreshView):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)