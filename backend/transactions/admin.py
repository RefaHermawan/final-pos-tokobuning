from django.contrib import admin
from .models import StoreInfo, HutangPiutang, Transaksi

# Daftarkan model Anda di sini
admin.site.register(StoreInfo)
admin.site.register(HutangPiutang)
admin.site.register(Transaksi)