# transactions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TransaksiViewSet,
    HutangPiutangViewSet,
    PembayaranViewSet,
    StockHistoryViewSet,
    StoreInfoView,
    DashboardStatsView,
    ManageStockView,
    StockOpnameView,
    TransactionCSVExportView,
    HutangPiutangSummaryView,
    ExpenseViewSet,
    CashFlowReportView,
    RecentActivityView,
    ProfitLossReportView,
    PelangganViewSet,
    RiwayatSimpananViewSet,
    SetoranSimpananView,
    SimpananSummaryView,
    PenarikanSimpananView,
    KasbonHistoryView
)

router = DefaultRouter()
router.register(r'transaksi', TransaksiViewSet, basename='transaksi')
router.register(r'hutang-piutang', HutangPiutangViewSet, basename='hutang-piutang')
router.register(r'pembayaran', PembayaranViewSet, basename='pembayaran')
router.register(r'stock-history', StockHistoryViewSet, basename='stock-history')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'pelanggan', PelangganViewSet, basename='pelanggan')
router.register(r'riwayat-simpanan', RiwayatSimpananViewSet, basename='riwayat-simpanan')

urlpatterns = [
    path('', include(router.urls)),
    # URL untuk StoreInfo karena menggunakan APIView, bukan ViewSet
    path('store-info/', StoreInfoView.as_view(), name='store-info'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'), # Tambahkan baris ini
    path('manage-stock/', ManageStockView.as_view(), name='manage-stock'),
    path('stock-opname/', StockOpnameView.as_view(), name='stock-opname'),
    path('export-transaksi-csv/', TransactionCSVExportView.as_view(), name='export-transaksi-csv'),
    path('hutang-piutang-summary/', HutangPiutangSummaryView.as_view(), name='hutang-piutang-summary'),
    path('laporan/arus-kas/', CashFlowReportView.as_view(), name='laporan-arus-kas'),
    path('laporan/laba-rugi/', ProfitLossReportView.as_view(), name='laporan-laba-rugi'),
    path('aktivitas-terbaru/', RecentActivityView.as_view(), name='aktivitas-terbaru'),
    path('kasbon-history/', KasbonHistoryView.as_view(), name='kasbon-history'),
    path('setoran-simpanan/', SetoranSimpananView.as_view(), name='setoran-simpanan'),
    path('simpanan-summary/', SimpananSummaryView.as_view(), name='simpanan-summary'),
    path('penarikan-simpanan/', PenarikanSimpananView.as_view(), name='penarikan-simpanan'),

]