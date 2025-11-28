from rest_framework import viewsets, status, generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from django.db import transaction
from rest_framework.response import Response
from pos_project.pagination import StandardResultsSetPagination
from django.db.models import F, Sum
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from transactions.models import DetailTransaksi
from rest_framework.decorators import action
import csv
import io
import requests 
from django.http import HttpResponse

from .models import Kategori, Pemasok, Produk, VarianProduk, AturanHargaKuantitas
from .serializers import (
    KategoriSerializer, PemasokSerializer, ProdukSerializer,
    VarianProdukSerializer, ProductCreateSerializer, VarianProdukAddSerializer,
    VarianUpdateWithRulesSerializer, AturanHargaKuantitasSerializer
)

# ViewSet ini tidak memerlukan perubahan besar
class KategoriViewSet(viewsets.ModelViewSet):
    """
    API untuk mengelola Kategori Produk.
    """
    queryset = Kategori.objects.all()
    serializer_class = KategoriSerializer
    # Menghapus pagination agar semua kategori tampil di dropdown filter
    pagination_class = None

# ViewSet ini tidak memerlukan perubahan besar
class PemasokViewSet(viewsets.ModelViewSet):
    """
    API untuk mengelola Pemasok.
    """
    queryset = Pemasok.objects.all()
    serializer_class = PemasokSerializer
    filter_backends = [SearchFilter]
    search_fields = ['nama_pemasok', 'kontak_person']
    # Menghapus pagination agar semua pemasok tampil di dropdown filter
    pagination_class = StandardResultsSetPagination # PASTIKAN BARIS INI ADA

# ==============================================================================
# === VIEWSET PRODUK INDUK (FOKUS PADA PEMBUATAN & TAMPILAN GRUP) ===
# ==============================================================================
class ProdukViewSet(viewsets.ModelViewSet):
    """
    API untuk produk induk. Endpoint utama untuk menampilkan data produk
    yang sudah dikelompokkan dan untuk membuat produk baru.
    """
    queryset = Produk.objects.distinct().prefetch_related('varian__pemasok', 'varian__aturan_harga').select_related('kategori').all().order_by('nama_produk')
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    # Filter sekarang dilakukan pada field di model Produk
    filterset_fields = ['kategori']
    search_fields = ['nama_produk', 'varian__nama_varian', 'varian__sku']

    def get_serializer_class(self):
        if self.action == 'create':
            return ProductCreateSerializer
        return ProdukSerializer

    # Metode create sekarang menggunakan logika dari serializer
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Menggunakan serializer baca untuk menampilkan data yang baru dibuat
        read_serializer = ProdukSerializer(serializer.instance)
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

# ==============================================================================
# === VIEWSET VARIAN PRODUK (FOKUS PADA AKSI PER VARIAN) ===
# ==============================================================================
class VarianProdukViewSet(viewsets.ModelViewSet):
    """
    API untuk aksi spesifik per varian: update, hapus, dan tambah varian baru.
    Juga digunakan untuk mengambil daftar varian 'flat' untuk kasir.
    """
    queryset = VarianProduk.objects.select_related('produk_induk__kategori', 'pemasok').all()
    filter_backends = [DjangoFilterBackend, SearchFilter]
    # Filter disesuaikan dengan model baru
    filterset_fields = {
        'produk_induk__kategori': ['exact'],
        'pemasok': ['exact'],
        'is_favorit': ['exact'],
    }
    search_fields = ['nama_varian', 'sku', 'produk_induk__nama_produk']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        show_all = self.request.query_params.get('status') == 'all'
        
        if self.action == 'list' and not show_all:
             return queryset.filter(is_active=True)
        return queryset
            
    def get_serializer_class(self):
        if self.action == 'create':
            return VarianProdukAddSerializer
        if self.action in ['update', 'partial_update']:
            return VarianUpdateWithRulesSerializer
        return VarianProdukSerializer
    
    # Logika hapus tidak berubah
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    # --- ENDPOINT BARU UNTUK MENGAKTIFKAN KEMBALI ---
    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        instance = self.get_object()
        instance.is_active = True
        instance.save()
        return Response({'status': 'varian diaktifkan'}, status=status.HTTP_200_OK)

# ViewSet ini tidak berubah
class AturanHargaKuantitasViewSet(viewsets.ModelViewSet):
    queryset = AturanHargaKuantitas.objects.all()
    serializer_class = AturanHargaKuantitasSerializer
    filterset_fields = ['varian_produk']

# ==============================================================================
# === VIEW LAPORAN (DIPERBARUI SESUAI MODEL BARU) ===
# ==============================================================================
class LowStockReportView(generics.ListAPIView):
    """
    API untuk laporan stok rendah, sekarang memfilter VarianProduk.
    """
    serializer_class = VarianProdukSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # Logika filter diperbarui untuk model baru
        return VarianProduk.objects.filter(
            stok__lte=F('peringatan_stok_rendah'),
            lacak_stok=True,
            is_active=True
        ).select_related('produk_induk', 'pemasok')

class LowStockCountView(APIView):
    """
    API untuk jumlah stok rendah, sekarang menghitung VarianProduk.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Logika filter diperbarui untuk model baru
        count = VarianProduk.objects.filter(
            stok__lte=F('peringatan_stok_rendah'),
            lacak_stok=True,
            is_active=True
        ).count()
        return Response({'count': count})

# View ini tidak terpengaruh oleh perubahan model produk
class BestSellingProductsView(generics.ListAPIView):
    """
    API untuk menampilkan 5 varian produk terlaris.
    Sekarang hanya mempertimbangkan varian yang masih aktif.
    """
    serializer_class = VarianProdukSerializer

    def get_queryset(self):
        seven_days_ago = timezone.now().date() - timedelta(days=7)
        
        # Ambil ID varian terlaris dari transaksi
        top_variant_ids = DetailTransaksi.objects.filter(
            transaksi__created_at__date__gte=seven_days_ago,
            # PERBAIKAN: Pastikan varian yang dijual masih aktif
            varian_produk_terjual__is_active=True 
        ).values(
            'varian_produk_terjual_id'
        ).annotate(
            total_sold=Sum('jumlah')
        ).order_by('-total_sold').values_list('varian_produk_terjual_id', flat=True)[:5]
        
        # Ambil objek VarianProduk berdasarkan ID terlaris
        return VarianProduk.objects.filter(id__in=top_variant_ids)

class ProductExportCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="daftar_produk.csv"'

        writer = csv.writer(response)
        # Tulis header
        writer.writerow([
            'nama_produk_induk', 'nama_varian', 'sku', 'kategori', 'pemasok',
            'stok', 'satuan', 'harga_beli', 'harga_ecer', 'harga_grosir', 'lacak_stok'
        ])

        # Ambil semua varian aktif
        variants = VarianProduk.objects.filter(is_active=True).select_related('produk_induk__kategori', 'pemasok')
        
        for v in variants:
            writer.writerow([
                v.produk_induk.nama_produk,
                v.nama_varian,
                v.sku,
                v.produk_induk.kategori.nama_kategori,
                v.pemasok.nama_pemasok if v.pemasok else '',
                v.stok,
                v.satuan,
                v.purchase_price,
                v.harga_jual_normal,
                v.harga_jual_reseller,
                v.lacak_stok
            ])
        
        return response
    
class ProductImportCSVView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({"error": "File tidak ditemukan."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_file = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)

            for row in reader:
                # Get or create Kategori dan Pemasok
                kategori, _ = Kategori.objects.get_or_create(nama_kategori=row['kategori'])
                pemasok = None
                if row.get('pemasok'):
                    pemasok, _ = Pemasok.objects.get_or_create(nama_pemasok=row['pemasok'])

                # Get or create Produk Induk
                produk_induk, _ = Produk.objects.get_or_create(
                    nama_produk=row['nama_produk_induk'],
                    defaults={'kategori': kategori}
                )

                # Siapkan data untuk VarianProduk
                varian_defaults = {
                    'produk_induk': produk_induk,
                    'pemasok': pemasok,
                    'stok': row.get('stok', 0),
                    'satuan': row.get('satuan', 'pcs'),
                    'purchase_price': row.get('harga_beli', 0),
                    'harga_jual_normal': row.get('harga_ecer', 0),
                    'harga_jual_reseller': row.get('harga_grosir') or None,
                    'lacak_stok': row.get('lacak_stok', 'True').lower() == 'true',
                }

                # Update atau buat VarianProduk berdasarkan SKU jika ada, jika tidak, berdasarkan nama
                if row.get('sku'):
                    VarianProduk.objects.update_or_create(
                        sku=row['sku'],
                        defaults={**varian_defaults, 'nama_varian': row['nama_varian']}
                    )
                else:
                    VarianProduk.objects.update_or_create(
                        produk_induk=produk_induk,
                        nama_varian=row['nama_varian'],
                        defaults=varian_defaults
                    )

        except Exception as e:
            return Response({"error": f"Terjadi kesalahan saat memproses file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"success": "Produk berhasil diimpor."}, status=status.HTTP_201_CREATED)
    
class BarcodeLookupView(APIView):
    """
    API untuk mencari detail produk berdasarkan barcode
    menggunakan database Open Food Facts.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        barcode = request.query_params.get('barcode', None)
        if not barcode:
            return Response({"error": "Parameter barcode dibutuhkan."}, status=status.HTTP_400_BAD_REQUEST)

        # URL API Open Food Facts
        url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
        
        try:
            response = requests.get(url)
            response.raise_for_status()  # Akan error jika status bukan 2xx
            data = response.json()

            if data.get('status') == 1 and data.get('product'):
                product_data = data['product']
                
                # Format data agar sesuai dengan form frontend kita
                formatted_data = {
                    'nama_produk_induk': product_data.get('product_name_id', '') or product_data.get('product_name', ''),
                    'nama_varian': product_data.get('generic_name_id', '') or product_data.get('generic_name', 'Eceran'),
                    'sku': barcode,
                    'kategori': product_data.get('categories_tags', [None])[0],
                    'pemasok': product_data.get('brands', None)
                }
                return Response(formatted_data)
            else:
                return Response({"error": "Produk tidak ditemukan di database Open Food Facts."}, status=status.HTTP_404_NOT_FOUND)

        except requests.exceptions.RequestException as e:
            return Response({"error": f"Gagal menghubungi layanan eksternal: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({"error": f"Terjadi kesalahan: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)