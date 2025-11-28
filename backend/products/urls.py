# products/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BestSellingProductsView,
    KategoriViewSet,
    PemasokViewSet,
    ProdukViewSet,
    VarianProdukViewSet,
    AturanHargaKuantitasViewSet,
    LowStockReportView,
    LowStockCountView,
    BestSellingProductsView,
    ProductExportCSVView,
    ProductImportCSVView,
    BarcodeLookupView
)

router = DefaultRouter()
router.register(r'kategori', KategoriViewSet, basename='kategori')
router.register(r'pemasok', PemasokViewSet, basename='pemasok')
router.register(r'produk', ProdukViewSet, basename='produk')
router.register(r'varian-produk', VarianProdukViewSet, basename='varian-produk')
router.register(r'aturan-harga', AturanHargaKuantitasViewSet, basename='aturan-harga')

urlpatterns = [
    path('', include(router.urls)),
        path('laporan/stok-rendah/', LowStockReportView.as_view(), name='laporan-stok-rendah'),
        path('laporan/stok-rendah/count/', LowStockCountView.as_view(), name='laporan-stok-rendah-count'),
        path('laporan/produk-terlaris/', BestSellingProductsView.as_view(), name='laporan-produk-terlaris'),
        path('export-produk-csv/', ProductExportCSVView.as_view(), name='export-produk-csv'),
        path('import-produk-csv/', ProductImportCSVView.as_view(), name='import-produk-csv'),
        path('lookup-barcode/', BarcodeLookupView.as_view(), name='lookup-barcode'),

]