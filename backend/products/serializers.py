from rest_framework import serializers
from .models import Kategori, Pemasok, Produk, VarianProduk, AturanHargaKuantitas
from django.db import transaction

# Serializer ini tidak berubah
class KategoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kategori
        fields = ['id', 'nama_kategori', 'deskripsi']

# Serializer ini tidak berubah
class PemasokSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pemasok
        fields = ['id', 'nama_pemasok', 'kontak_person', 'nomor_telepon', 'alamat']

# Serializer ini tidak berubah
class AturanHargaKuantitasSerializer(serializers.ModelSerializer):
    class Meta:
        model = AturanHargaKuantitas
        fields = ['id', 'varian_produk', 'jumlah_minimal', 'harga_total_khusus']
        read_only_fields = ['id', 'varian_produk']

# ==============================================================================
# === SERIALIZER UTAMA UNTUK MEMBACA/MENAMPILKAN DATA (PERUBAHAN BESAR) ===
# ==============================================================================
class VarianProdukSerializer(serializers.ModelSerializer):
    # Mengambil info dari relasi ForeignKey
    nama_produk_induk = serializers.CharField(source='produk_induk.nama_produk', read_only=True)
    kategori = serializers.CharField(source='produk_induk.kategori.nama_kategori', read_only=True)
    pemasok_nama = serializers.CharField(source='pemasok.nama_pemasok', read_only=True, allow_null=True)
    aturan_harga = AturanHargaKuantitasSerializer(many=True, read_only=True)
    varian_count = serializers.SerializerMethodField()

    class Meta:
        model = VarianProduk
        # Field sekarang diambil langsung dari VarianProduk, bukan dari produk_induk
        fields = [
            'id', 'produk_induk', 'nama_varian', 'sku', 
            'stok', 'satuan', 'purchase_price', 'peringatan_stok_rendah',
            'lacak_stok', 'pemasok', 'harga_jual_normal', 'harga_jual_reseller',
            'is_favorit', 'is_active', 
            # Field tambahan untuk tampilan
            'nama_produk_induk', 'kategori', 'pemasok_nama', 'aturan_harga', 'varian_count'
        ]
    
    def get_varian_count(self, obj):
        if obj.produk_induk:
            return obj.produk_induk.varian.count()
        return 0

class ProdukSerializer(serializers.ModelSerializer):
    # Serializer ini sekarang lebih sederhana, hanya untuk menampilkan produk induk
    # dan semua variannya secara nested.
    varian = VarianProdukSerializer(many=True, read_only=True)
    kategori = KategoriSerializer(read_only=True)

    class Meta:
        model = Produk
        fields = ['id', 'nama_produk', 'kategori', 'varian']


# ==============================================================================
# === SERIALIZER UNTUK MENULIS/MEMBUAT DATA BARU (PERUBAHAN BESAR) ===
# ==============================================================================
class VarianPertamaCreateSerializer(serializers.ModelSerializer):
    """Serializer helper untuk menerima data varian pertama saat membuat produk."""
    class Meta:
        model = VarianProduk
        # Semua field yang dibutuhkan dari form untuk varian pertama
        fields = [
            'nama_varian', 'sku', 'stok', 'satuan', 'purchase_price',
            'peringatan_stok_rendah', 'lacak_stok', 'pemasok',
            'harga_jual_normal', 'harga_jual_reseller'
        ]

class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer utama untuk form Tambah Produk."""
    varian_pertama = VarianPertamaCreateSerializer(write_only=True)
    kategori = serializers.PrimaryKeyRelatedField(queryset=Kategori.objects.all())

    class Meta:
        model = Produk
        fields = ['nama_produk', 'kategori', 'varian_pertama']

    @transaction.atomic
    def create(self, validated_data):
        varian_data = validated_data.pop('varian_pertama')
        # Buat Produk Induk
        produk = Produk.objects.create(**validated_data)
        # Buat Varian Pertama yang terhubung dengannya
        VarianProduk.objects.create(produk_induk=produk, **varian_data)
        return produk


# ==============================================================================
# === SERIALIZER UNTUK UPDATE & TAMBAH VARIAN (PENYESUAIAN) ===
# ==============================================================================
class VarianProdukAddSerializer(serializers.ModelSerializer):
    """Serializer untuk menambah varian baru ke produk yang sudah ada."""
    class Meta:
        model = VarianProduk
        fields = [
            'produk_induk', 'nama_varian', 'sku', 'stok', 'satuan', 
            'purchase_price', 'peringatan_stok_rendah', 'lacak_stok', 'pemasok',
            'harga_jual_normal', 'harga_jual_reseller'
        ]

class VarianUpdateWithRulesSerializer(serializers.ModelSerializer):
    """Serializer untuk mengedit varian beserta aturan harganya."""
    aturan_harga = AturanHargaKuantitasSerializer(many=True, required=False)

    class Meta:
        model = VarianProduk
        fields = [
            'nama_varian', 'sku', 'stok', 'satuan', 'purchase_price',
            'peringatan_stok_rendah', 'lacak_stok', 'pemasok',
            'harga_jual_normal', 'harga_jual_reseller', 'aturan_harga'
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        rules_data = validated_data.pop('aturan_harga', [])
        AturanHargaKuantitas.objects.filter(varian_produk=instance).delete()
        for rule_data in rules_data:
            AturanHargaKuantitas.objects.create(varian_produk=instance, **rule_data)
        return super().update(instance, validated_data)
