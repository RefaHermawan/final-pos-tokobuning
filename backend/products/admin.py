from django.contrib import admin
from .models import Kategori, Pemasok, Produk, VarianProduk, AturanHargaKuantitas

admin.site.register(Kategori)
admin.site.register(Pemasok)
admin.site.register(Produk)
admin.site.register(VarianProduk)
admin.site.register(AturanHargaKuantitas)