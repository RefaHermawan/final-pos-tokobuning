import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.db.models import Sum

class StoreInfo(models.Model):
    nama_toko = models.CharField(max_length=100, default='Toko Bu Ning')
    alamat = models.TextField(blank=True, null=True)
    telepon = models.CharField(max_length=20, blank=True, null=True)
    footer_struk = models.CharField(max_length=255, default="Terima Kasih Telah Berbelanja!")

class Transaksi(models.Model):

    STATUS_CHOICES = [('Selesai', 'Selesai'), ('Dibatalkan', 'Dibatalkan'), ('Ditahan', 'Ditahan')]
    METODE_PEMBAYARAN_CHOICES = [('Tunai', 'Tunai'), ('QRIS', 'QRIS'), ('Debit', 'Debit')]
    CUSTOMER_TYPE_CHOICES = [('Biasa', 'Biasa'), ('Reseller', 'Reseller')]

    customer_type = models.CharField(max_length=10, choices=CUSTOMER_TYPE_CHOICES, default='Biasa')
    notes = models.CharField(max_length=100, blank=True, null=True, help_text="Catatan atau nama untuk transaksi yang ditahan")
    nomor_transaksi = models.CharField(max_length=50, unique=True, editable=False)
    kasir = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='transaksi_dibuat')
    total_harga = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    diskon_nominal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_setelah_diskon = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    jumlah_bayar = models.DecimalField(max_digits=12, decimal_places=2)
    kembalian = models.DecimalField(max_digits=12, decimal_places=2)
    metode_pembayaran = models.CharField(max_length=20, choices=METODE_PEMBAYARAN_CHOICES, default='Tunai')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Selesai')
    created_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.nomor_transaksi:
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            self.nomor_transaksi = f"INV-{timestamp}-{str(uuid.uuid4()).split('-')[0].upper()}"
        super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "Transaksi"
        
    def __str__(self):
        return self.nomor_transaksi

class DetailTransaksi(models.Model):
    """
    Model untuk mencatat setiap item di dalam sebuah transaksi.
    """
    transaksi = models.ForeignKey(Transaksi, on_delete=models.CASCADE, related_name='detail_items')
    varian_produk_terjual = models.ForeignKey('products.VarianProduk', on_delete=models.PROTECT)
    jumlah = models.DecimalField(max_digits=10, decimal_places=3)
    harga_saat_transaksi = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name_plural = "Detail Transaksi"

    def __str__(self):
        return f"{self.jumlah} x {self.varian_produk_terjual.nama_varian}"

class HutangPiutang(models.Model):
    """
    Model untuk mencatat hutang ke supplier dan piutang dari pelanggan.
    """
    class Tipe(models.TextChoices):
        HUTANG = 'HUTANG', 'Hutang Dagang'
        PIUTANG = 'PIUTANG', 'Piutang Dagang'

    tipe = models.CharField(max_length=10, choices=Tipe.choices)
    pelanggan_nama = models.CharField(max_length=150, blank=True, null=True)
    supplier = models.ForeignKey('products.Pemasok', on_delete=models.SET_NULL, null=True, blank=True)
    total_awal = models.DecimalField(max_digits=12, decimal_places=2)
    lunas = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    tanggal_jatuh_tempo = models.DateField(null=True, blank=True)
    dicatat_oleh = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    @property
    def total_dibayar(self):
        return self.pembayaran_set.aggregate(total=Sum('jumlah_bayar'))['total'] or 0

    @property
    def sisa_tagihan(self):
        return self.total_awal - self.total_dibayar

    def save(self, *args, **kwargs):
        if self.pk is not None: # Hanya cek jika objek sudah ada di DB
            if self.sisa_tagihan <= 0:
                self.lunas = True
            else:
                self.lunas = False
        super().save(*args, **kwargs)

class Pembayaran(models.Model):
    """
    Model untuk mencatat setiap pembayaran (cicilan) untuk hutang/piutang.
    """
    hutang_piutang = models.ForeignKey(HutangPiutang, on_delete=models.CASCADE)
    jumlah_bayar = models.DecimalField(max_digits=12, decimal_places=2)
    tanggal_bayar = models.DateTimeField(auto_now_add=True)
    dicatat_oleh = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    catatan = models.CharField(max_length=255, blank=True, null=True)

class StockHistory(models.Model):
    """
    Model untuk mencatat setiap pergerakan stok (masuk, keluar, penjualan, opname).
    """
    class Reason(models.TextChoices):
        PEMBELIAN = 'PEMBELIAN', 'Pembelian dari Supplier'
        AWAL = 'AWAL', 'Stok Awal'
        RETUR = 'RETUR', 'Retur Pelanggan'
        RUSAK = 'RUSAK', 'Barang Rusak/Kadaluwarsa'
        HILANG = 'HILANG', 'Barang Hilang'
        INTERNAL = 'INTERNAL', 'Keperluan Toko'
        OPNAME = 'OPNAME', 'Penyesuaian Opname'
        PENJUALAN = 'PENJUALAN', 'Penjualan Kasir'

    product = models.ForeignKey('products.VarianProduk', on_delete=models.CASCADE, related_name="stock_history")
    quantity_change = models.DecimalField(max_digits=10, decimal_places=3, help_text="Positif untuk stok masuk, negatif untuk stok keluar")
    stock_after = models.DecimalField(max_digits=10, decimal_places=3, default=0, help_text="Jumlah stok setelah perubahan")
    reason = models.CharField(max_length=20, choices=Reason.choices, default=Reason.PEMBELIAN)
    notes = models.TextField(blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Expense(models.Model):
    keterangan = models.CharField(max_length=255)
    jumlah = models.DecimalField(max_digits=12, decimal_places=2)
    tanggal = models.DateField(default=timezone.now)
    dicatat_oleh = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.keterangan} - {self.jumlah}"
    
class Pelanggan(models.Model):
    """
    Model untuk menyimpan data pelanggan yang memiliki simpanan.
    """
    nama_pelanggan = models.CharField(max_length=200, unique=True)
    nomor_telepon = models.CharField(max_length=20, blank=True, null=True)
    alamat = models.TextField(blank=True, null=True)
    
    @property
    def saldo_simpanan(self):
        """Menghitung saldo simpanan saat ini secara dinamis."""
        total_masuk = self.riwayat_simpanan.filter(tipe='MASUK').aggregate(total=Sum('jumlah'))['total'] or 0
        total_keluar = self.riwayat_simpanan.filter(tipe='KELUAR').aggregate(total=Sum('jumlah'))['total'] or 0
        return total_masuk - total_keluar

    def __str__(self):
        return self.nama_pelanggan

class RiwayatSimpanan(models.Model):
    """
    Model untuk mencatat setiap transaksi simpanan (setoran atau penarikan/pembayaran).
    """
    class Tipe(models.TextChoices):
        MASUK = 'MASUK', 'Setoran Tunai'
        KELUAR = 'KELUAR', 'Digunakan untuk Pembayaran'

    pelanggan = models.ForeignKey(Pelanggan, on_delete=models.CASCADE, related_name='riwayat_simpanan')
    tipe = models.CharField(max_length=10, choices=Tipe.choices)
    jumlah = models.DecimalField(max_digits=12, decimal_places=2)
    saldo_setelah = models.DecimalField(max_digits=12, decimal_places=2)
    keterangan = models.CharField(max_length=255, blank=True, null=True)
    dicatat_oleh = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipe} - {self.pelanggan.nama_pelanggan} - {self.jumlah}"
