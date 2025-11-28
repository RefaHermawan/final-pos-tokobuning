from rest_framework import serializers
from .models import Transaksi, DetailTransaksi, HutangPiutang, Pembayaran, StockHistory, StoreInfo, Expense, Pelanggan, RiwayatSimpanan
from products.models import VarianProduk, Pemasok
from users.serializers import UserSerializer
from products.serializers import VarianProdukSerializer

# ==============================================================================
# === SERIALIZER UNTUK TRANSAKSI PENJUALAN ===
# ==============================================================================
class DetailTransaksiCreateSerializer(serializers.Serializer):
    """Menerima data item saat membuat transaksi baru."""
    varian_produk_id = serializers.IntegerField()
    jumlah = serializers.DecimalField(max_digits=10, decimal_places=3)

class TransaksiCreateSerializer(serializers.Serializer):
    """Menerima data utama saat membuat transaksi baru."""
    metode_pembayaran = serializers.ChoiceField(choices=Transaksi.METODE_PEMBAYARAN_CHOICES)
    jumlah_bayar = serializers.DecimalField(max_digits=12, decimal_places=2)
    diskon_nominal = serializers.DecimalField(max_digits=12, decimal_places=2, default=0, required=False)
    detail_items = DetailTransaksiCreateSerializer(many=True)
    customer_type = serializers.ChoiceField(choices=Transaksi.CUSTOMER_TYPE_CHOICES, required=False)
    notes = serializers.CharField(max_length=100, required=False, allow_blank=True) # Tambahkan ini

class DetailTransaksiReadSerializer(serializers.ModelSerializer):
    """Menampilkan detail item di dalam riwayat transaksi."""
    varian_produk_terjual = VarianProdukSerializer(read_only=True)
    class Meta:
        model = DetailTransaksi
        fields = '__all__'

class TransaksiReadSerializer(serializers.ModelSerializer):
    """Menampilkan data transaksi secara lengkap."""
    detail_items = DetailTransaksiReadSerializer(many=True, read_only=True)
    kasir = UserSerializer(read_only=True)
    class Meta:
        model = Transaksi
        fields = '__all__'

# ==============================================================================
# === SERIALIZER UNTUK HUTANG & PIUTANG ===
# ==============================================================================
class HutangPiutangSerializer(serializers.ModelSerializer):
    """Membaca data Hutang & Piutang."""
    supplier_name = serializers.CharField(source='supplier.nama_pemasok', read_only=True, default='')
    pelanggan_name = serializers.CharField(source='pelanggan_nama', read_only=True)
    total_dibayar = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    sisa_tagihan = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = HutangPiutang
        fields = '__all__'

class PiutangCreateSerializer(serializers.ModelSerializer):
    """Membuat Piutang baru."""
    class Meta:
        model = HutangPiutang
        fields = ['pelanggan_nama', 'total_awal', 'tanggal_jatuh_tempo']

class HutangCreateSerializer(serializers.ModelSerializer):
    """Membuat Hutang baru."""
    supplier = serializers.PrimaryKeyRelatedField(queryset=Pemasok.objects.all())
    class Meta:
        model = HutangPiutang
        fields = ['supplier', 'total_awal', 'tanggal_jatuh_tempo']

# ==============================================================================
# === SERIALIZER UNTUK PEMBAYARAN ===
# ==============================================================================
class PembayaranReadSerializer(serializers.ModelSerializer):
    """Menampilkan riwayat pembayaran."""
    dicatat_oleh_username = serializers.CharField(source='dicatat_oleh.username', read_only=True, default='')
    class Meta:
        model = Pembayaran
        fields = '__all__'

class PembayaranSerializer(serializers.ModelSerializer):
    """Mencatat pembayaran baru."""
    class Meta:
        model = Pembayaran
        fields = ['hutang_piutang', 'jumlah_bayar', 'catatan']

# ==============================================================================
# === SERIALIZER UNTUK STOK & PENGATURAN ===
# ==============================================================================
class StockHistorySerializer(serializers.ModelSerializer):
    """Menampilkan riwayat pergerakan stok."""
    # 'product' di model StockHistory sudah benar menunjuk ke VarianProduk
    product_name = serializers.CharField(source='product.nama_varian', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True, default='')
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    nama_produk_induk = serializers.CharField(source='product.produk_induk.nama_produk', read_only=True)
    satuan = serializers.CharField(source='product.satuan', read_only=True)

    class Meta:
        model = StockHistory
        fields = '__all__'

class StockOpnameItemSerializer(serializers.Serializer):
    """Serializer untuk memvalidasi data saat proses stok opname."""
    varian_id = serializers.IntegerField()
    physical_count = serializers.DecimalField(max_digits=10, decimal_places=3)

class StoreInfoSerializer(serializers.ModelSerializer):
    """Mengelola informasi toko."""
    class Meta:
        model = StoreInfo
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    """Mengelola biaya operasional."""
    class Meta:
        model = Expense
        fields = '__all__'

class PelangganSerializer(serializers.ModelSerializer):
    """Serializer untuk menampilkan data pelanggan beserta saldonya."""
    saldo_simpanan = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Pelanggan
        fields = ['id', 'nama_pelanggan', 'nomor_telepon', 'alamat', 'saldo_simpanan']

class RiwayatSimpananSerializer(serializers.ModelSerializer):
    """Serializer untuk menampilkan riwayat simpanan."""
    dicatat_oleh_username = serializers.CharField(source='dicatat_oleh.username', read_only=True, allow_null=True)
    
    class Meta:
        model = RiwayatSimpanan
        fields = '__all__'

class SetoranSimpananSerializer(serializers.Serializer):
    """Serializer untuk menerima data saat ada setoran baru."""
    nama_pelanggan = serializers.CharField(max_length=200)
    jumlah = serializers.DecimalField(max_digits=12, decimal_places=2)
    keterangan = serializers.CharField(required=False, allow_blank=True)
    # Tambahkan field baru (opsional)
    nomor_telepon = serializers.CharField(max_length=20, required=False, allow_blank=True)
    alamat = serializers.CharField(required=False, allow_blank=True)

class PenarikanSimpananSerializer(serializers.Serializer):
    """Serializer untuk menerima data saat ada penarikan tunai."""
    pelanggan_id = serializers.IntegerField()
    jumlah = serializers.DecimalField(max_digits=12, decimal_places=2)
    keterangan = serializers.CharField(required=False, allow_blank=True)

class AddAmountSerializer(serializers.Serializer):
    amount_to_add = serializers.DecimalField(max_digits=12, decimal_places=2)