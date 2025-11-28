from django.db import models

class Kategori(models.Model):
    nama_kategori = models.CharField(max_length=100, unique=True)
    deskripsi = models.TextField(blank=True, null=True)
    def __str__(self): return self.nama_kategori

class Pemasok(models.Model):
    """
    Model untuk menyimpan data supplier atau pemasok barang.
    """
    nama_pemasok = models.CharField(max_length=200)
    kontak_person = models.CharField(max_length=100, blank=True, null=True)
    nomor_telepon = models.CharField(max_length=20, blank=True, null=True)
    alamat = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Pemasok"

    def __str__(self):
        return self.nama_pemasok

class Produk(models.Model):
    """
    Model untuk produk induk yang merepresentasikan barang secara fisik di gudang.
    """
    nama_produk = models.CharField(max_length=200, unique=True, help_text="Contoh: Indomie Goreng, Gula Pasir Curah")
    kategori = models.ForeignKey(Kategori, on_delete=models.PROTECT, related_name='produk')

    def __str__(self):
        return self.nama_produk

class VarianProduk(models.Model):
    """
    Model untuk setiap varian yang dijual. STOK SEKARANG DI SINI.
    """
    SATUAN_CHOICES = [('pcs', 'Pcs'), ('kg', 'Kg'), ('gram', 'Gram'), ('liter', 'Liter'), ('bungkus', 'Bungkus'), ('sachet', 'Sachet')]

    produk_induk = models.ForeignKey(Produk, on_delete=models.CASCADE, related_name='varian')
    nama_varian = models.CharField(max_length=100)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)

    # --- FIELD YANG DIPINDAHKAN KE SINI ---
    stok = models.DecimalField(max_digits=10, decimal_places=3, default=0.000)
    satuan = models.CharField(max_length=10, choices=SATUAN_CHOICES)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    peringatan_stok_rendah = models.DecimalField(max_digits=10, decimal_places=3, default=10.000)
    lacak_stok = models.BooleanField(default=True)

    # ------------------------------------

    pemasok = models.ForeignKey(Pemasok, on_delete=models.SET_NULL, null=True, blank=True, related_name='varian_produk')
    harga_jual_normal = models.DecimalField(max_digits=12, decimal_places=2)
    harga_jual_reseller = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    is_favorit = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True, help_text="Nonaktifkan untuk menyembunyikan dari daftar jual")

    class Meta:
        # Memastikan tidak ada nama varian yang sama untuk satu produk induk
        unique_together = ('produk_induk', 'nama_varian')
        verbose_name_plural = "Varian Produk"
        
    def __str__(self):
        return f"{self.produk_induk.nama_produk} ({self.nama_varian})"

class AturanHargaKuantitas(models.Model):
    """
    Model untuk harga berdasarkan jumlah, cth: beli 1 harga Rp 3.500, beli 2 harga Rp 6.500, beli 3 harga Rp 10.000.
    """
    varian_produk = models.ForeignKey(VarianProduk, on_delete=models.CASCADE, related_name='aturan_harga')
    jumlah_minimal = models.PositiveIntegerField()
    harga_total_khusus = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ('varian_produk', 'jumlah_minimal')
        verbose_name_plural = "Aturan Harga Kuantitas"

    def __str__(self):
        return f"Aturan {self.varian_produk.nama_varian}: Beli {self.jumlah_minimal} seharga {self.harga_total_khusus}"