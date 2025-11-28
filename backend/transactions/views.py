# transactions/views.py

from django.db import transaction, models
from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from decimal import Decimal
from itertools import chain
from operator import itemgetter
from django.utils import timezone
from django.db.models import Sum, Count, F, DecimalField, Value, ExpressionWrapper
from django.db.models.functions import Coalesce, Cast, TruncDay
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend 
from rest_framework.filters import SearchFilter
from pos_project.pagination import StandardResultsSetPagination
import csv
from django.http import HttpResponse
from .models import (
    Transaksi, DetailTransaksi, HutangPiutang, Pembayaran, StockHistory, StoreInfo, Expense, Pelanggan, RiwayatSimpanan
)
from products.models import VarianProduk, Produk
from products.serializers import VarianProdukSerializer
from .serializers import (
    TransaksiReadSerializer, TransaksiCreateSerializer,
    HutangPiutangSerializer, PiutangCreateSerializer, HutangCreateSerializer,
    PembayaranSerializer, PembayaranReadSerializer,
    StockHistorySerializer, StoreInfoSerializer, ExpenseSerializer,
    PelangganSerializer, RiwayatSimpananSerializer, SetoranSimpananSerializer,
    PenarikanSimpananSerializer, AddAmountSerializer
)

class TransaksiViewSet(viewsets.ModelViewSet):
    """
    API untuk mengelola Transaksi.
    Logika pembuatan transaksi (POST) disesuaikan dengan model stok per varian.
    """
    queryset = Transaksi.objects.select_related('kasir').all().order_by('-created_at')
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'created_at': ['gte', 'lte'],
        'kasir': ['exact'],
        'metode_pembayaran': ['exact'],
        'status': ['exact']
    }
    
    def get_serializer_class(self, *args, **kwargs):
        if self.action in ['create', 'resume_transaction']:
            return TransaksiCreateSerializer
        return TransaksiReadSerializer

    def list(self, request, *args, **kwargs):
        
        filtered_queryset = self.filter_queryset(self.get_queryset())

        summary = filtered_queryset.aggregate(
            total_penjualan=Coalesce(Sum('total_setelah_diskon'), Value(0, output_field=DecimalField())),
            jumlah_transaksi=Count('id')
        )

        page = self.paginate_queryset(filtered_queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['summary'] = summary
            return response

        serializer = self.get_serializer(filtered_queryset, many=True)
        return Response({
            'summary': summary,
            'results': serializer.data
        })

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        detail_items_data = data.pop('detail_items')
        kasir = request.user

        total_harga = Decimal('0.0')
        items_to_create = []

        for item_data in detail_items_data:
            try:
                varian = VarianProduk.objects.get(id=item_data['varian_produk_id'])
            except VarianProduk.DoesNotExist:
                return Response({'error': f"Varian produk dengan ID {item_data['varian_produk_id']} tidak ditemukan."}, status=status.HTTP_400_BAD_REQUEST)

            if varian.lacak_stok and varian.stok < item_data['jumlah']:
                return Response({'error': f"Stok untuk '{varian}' tidak mencukupi. Sisa: {varian.stok}"}, status=status.HTTP_400_BAD_REQUEST)

            subtotal = varian.harga_jual_normal * item_data['jumlah']
            total_harga += subtotal

            if varian.lacak_stok:
                varian.stok -= item_data['jumlah']
                varian.save()
                
                StockHistory.objects.create(
                    product=varian,
                    quantity_change=-item_data['jumlah'],
                    stock_after=varian.stok,
                    reason=StockHistory.Reason.PENJUALAN,
                    user=kasir
                )

            items_to_create.append({
                'varian': varian, 'jumlah': item_data['jumlah'],
                'harga_saat_transaksi': varian.harga_jual_normal, 'subtotal': subtotal
            })

        diskon = data.get('diskon_nominal', Decimal('0.0'))
        total_setelah_diskon = total_harga - diskon
        jumlah_bayar = data['jumlah_bayar']
        kembalian = jumlah_bayar - total_setelah_diskon

        if kembalian < 0:
            return Response({'error': 'Jumlah bayar tidak mencukupi.'}, status=status.HTTP_400_BAD_REQUEST)

        transaksi_baru = Transaksi.objects.create(
            kasir=kasir,
            total_harga=total_harga,
            diskon_nominal=diskon,
            total_setelah_diskon=total_setelah_diskon,
            jumlah_bayar=jumlah_bayar,
            kembalian=kembalian,
            metode_pembayaran=data['metode_pembayaran'],
            customer_type=data.get('customer_type', 'Biasa'),
            status='Selesai'  # PERBAIKAN: Pastikan status diatur ke 'Selesai'
        )
        
        StockHistory.objects.filter(product__in=[item['varian'] for item in items_to_create], user=kasir).update(notes=f"Transaksi No: {transaksi_baru.nomor_transaksi}")

        for item in items_to_create:
            DetailTransaksi.objects.create(
                transaksi=transaksi_baru,
                varian_produk_terjual=item['varian'],
                jumlah=item['jumlah'],
                harga_saat_transaksi=item['harga_saat_transaksi'],
                subtotal=item['subtotal']
            )

        response_serializer = TransaksiReadSerializer(transaksi_baru)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'])
    @transaction.atomic
    def update_held_transaction(self, request, pk=None):
        instance = self.get_object()
        if instance.status != 'Ditahan':
            return Response({'error': 'Hanya transaksi ditahan yang bisa diupdate.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Kita bisa gunakan create serializer untuk validasi data
        serializer = TransaksiCreateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        detail_items_data = data.get('detail_items', [])

        # Hapus detail lama dan buat yang baru
        instance.detail_items.all().delete()
        
        total_harga = Decimal('0.0')
        for item_data in detail_items_data:
            varian = VarianProduk.objects.get(id=item_data['varian_produk_id'])
            subtotal = varian.harga_jual_normal * item_data['jumlah']
            total_harga += subtotal
            DetailTransaksi.objects.create(
                transaksi=instance,
                varian_produk_terjual_id=item_data['varian_produk_id'],
                jumlah=item_data['jumlah'],
                harga_saat_transaksi=varian.harga_jual_normal,
                subtotal=subtotal
            )
        
        # Update total di transaksi induk
        instance.total_harga = total_harga
        instance.total_setelah_diskon = total_harga # Asumsi diskon direset
        instance.customer_type = data.get('customer_type', instance.customer_type)
        instance.save()
        
        response_serializer = TransaksiReadSerializer(instance)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def hold_transaction(self, request, *args, **kwargs):
        serializer = TransaksiCreateSerializer(data=request.data, partial=True) # partial=True karena tidak ada data pembayaran
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        detail_items_data = data.get('detail_items', [])
        
        if not detail_items_data:
            return Response({'error': 'Keranjang tidak boleh kosong.'}, status=status.HTTP_400_BAD_REQUEST)

        total_harga = Decimal('0.0')
        for item_data in detail_items_data:
            varian = VarianProduk.objects.get(id=item_data['varian_produk_id'])
            subtotal = varian.harga_jual_normal * item_data['jumlah'] # Harga akan dihitung ulang saat dilanjutkan
            total_harga += subtotal
        
        # Buat transaksi dengan status 'Ditahan'
        transaksi_ditahan = Transaksi.objects.create(
            kasir=request.user,
            total_harga=total_harga,
            total_setelah_diskon=total_harga,
            jumlah_bayar=0,
            kembalian=0,
            customer_type=data.get('customer_type', 'Biasa'),
            status='Ditahan',
            notes=data.get('notes', None) # Tambahkan ini
        )
        for item_data in detail_items_data:
            DetailTransaksi.objects.create(
                transaksi=transaksi_ditahan,
                varian_produk_terjual_id=item_data['varian_produk_id'],
                jumlah=item_data['jumlah'],
                harga_saat_transaksi=VarianProduk.objects.get(id=item_data['varian_produk_id']).harga_jual_normal,
                subtotal=VarianProduk.objects.get(id=item_data['varian_produk_id']).harga_jual_normal * item_data['jumlah']
            )
        
        response_serializer = TransaksiReadSerializer(transaksi_ditahan)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    # --- AKSI BARU UNTUK MELANJUTKAN TRANSAKSI ---
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def resume_transaction(self, request, pk=None):
        instance = self.get_object()
        if instance.status != 'Ditahan':
            return Response({'error': 'Hanya transaksi yang ditahan yang bisa dilanjutkan.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TransaksiCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment_data = serializer.validated_data
        
        # Di sini kita akan mengurangi stok
        total_harga_final = Decimal('0.0')
        for detail in instance.detail_items.all():
            varian = detail.varian_produk_terjual
            if varian.lacak_stok and varian.stok < detail.jumlah:
                return Response({'error': f"Stok untuk '{varian}' tidak mencukupi."}, status=status.HTTP_400_BAD_REQUEST)
            
            if varian.lacak_stok:
                varian.stok -= detail.jumlah
                varian.save()
                StockHistory.objects.create(
                    product=varian,
                    quantity_change=-detail.jumlah,
                    stock_after=varian.stok,
                    reason=StockHistory.Reason.PENJUALAN,
                    user=request.user,
                    notes=f"Transaksi No: {instance.nomor_transaksi}"
                )
            total_harga_final += detail.subtotal # Gunakan subtotal yang sudah tersimpan

        # Update transaksi dengan data pembayaran
        instance.total_harga = total_harga_final
        instance.diskon_nominal = payment_data.get('diskon_nominal', 0)
        instance.total_setelah_diskon = total_harga_final - instance.diskon_nominal
        instance.jumlah_bayar = payment_data['jumlah_bayar']
        instance.kembalian = instance.jumlah_bayar - instance.total_setelah_diskon
        instance.metode_pembayaran = payment_data['metode_pembayaran']
        instance.status = 'Selesai'
        instance.save()
        
        response_serializer = TransaksiReadSerializer(instance)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class HutangPiutangViewSet(viewsets.ModelViewSet):
    queryset = HutangPiutang.objects.all().order_by('-created_at')
    serializer_class = HutangPiutangSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter] 
    filterset_fields = ['tipe', 'lunas']
    search_fields = ['pelanggan_nama', 'supplier__nama_pemasok']
    pagination_class = StandardResultsSetPagination # <-- TAMBAHKAN BARIS INI

    @action(detail=False, methods=['post'], serializer_class=PiutangCreateSerializer, url_path='create-piutang')
    def create_piutang(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        HutangPiutang.objects.create(
            tipe=HutangPiutang.Tipe.PIUTANG,
            dicatat_oleh=request.user,
            **serializer.validated_data
        )
        return Response({'status': 'Piutang berhasil dibuat'}, status=status.HTTP_201_CREATED)

    # Pastikan 'methods' juga ada di sini
    @action(detail=False, methods=['post'], serializer_class=HutangCreateSerializer, url_path='create-hutang')
    def create_hutang(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        HutangPiutang.objects.create(
            tipe=HutangPiutang.Tipe.HUTANG,
            dicatat_oleh=request.user,
            **serializer.validated_data
        )
        return Response({'status': 'Hutang berhasil dibuat'}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], serializer_class=AddAmountSerializer)
    def add_amount(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount_to_add = serializer.validated_data['amount_to_add']

        # Tambahkan nominal baru ke total yang lama
        instance.total_awal += amount_to_add
        instance.save()

        # Kembalikan data yang sudah diperbarui
        read_serializer = HutangPiutangSerializer(instance)
        return Response(read_serializer.data)

class HutangPiutangSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        tipe = request.query_params.get('tipe', None)
        if not tipe:
            return Response({'error': 'Parameter tipe (HUTANG/PIUTANG) dibutuhkan.'}, status=400)

        # Hitung total awal dari semua item
        total_awal_agg = HutangPiutang.objects.filter(tipe=tipe).aggregate(total=Sum('total_awal'))
        total_awal = total_awal_agg['total'] or 0

        # Hitung total yang sudah dibayar dari semua pembayaran terkait
        total_dibayar_agg = Pembayaran.objects.filter(hutang_piutang__tipe=tipe).aggregate(total=Sum('jumlah_bayar'))
        total_dibayar = total_dibayar_agg['total'] or 0

        sisa_tagihan = total_awal - total_dibayar

        data = {
            'total_awal': total_awal,
            'total_dibayar': total_dibayar,
            'sisa_tagihan': sisa_tagihan
        }
        return Response(data)

    @action(detail=False, methods=['post'], serializer_class=HutangCreateSerializer, url_path='create-hutang')
    def create_hutang(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        HutangPiutang.objects.create(
            tipe=HutangPiutang.Tipe.HUTANG,
            dicatat_oleh=request.user,
            **serializer.validated_data
        )
        return Response({'status': 'Hutang berhasil dibuat'}, status=status.HTTP_201_CREATED)

class PembayaranViewSet(viewsets.ModelViewSet):
    queryset = Pembayaran.objects.all().order_by('-tanggal_bayar')
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['hutang_piutang']
    
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return PembayaranReadSerializer
        return PembayaranSerializer

    def perform_create(self, serializer):
        pembayaran = serializer.save(dicatat_oleh=self.request.user)
        # Update status lunas pada HutangPiutang terkait secara otomatis
        pembayaran.hutang_piutang.save()

class ManageStockView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        items = request.data.get('items', [])
        reason = request.data.get('reason')

        if not all([items, reason]):
            return Response({'error': 'Data tidak lengkap.'}, status=status.HTTP_400_BAD_REQUEST)

        for item in items:
            varian_id = item.get('varian_id')
            quantity = Decimal(item.get('quantity', 0))

            try:
                varian = VarianProduk.objects.get(id=varian_id)
            except VarianProduk.DoesNotExist:
                continue 

            quantity_change = quantity if reason == 'PEMBELIAN' else -quantity
            
            varian.stok += quantity_change
            
            if reason == 'PEMBELIAN' and 'purchase_price' in item and item['purchase_price']:
                varian.purchase_price = Decimal(item.get('purchase_price'))
            
            varian.save()

            StockHistory.objects.create(
                product=varian,
                quantity_change=quantity_change,
                stock_after=varian.stok,
                reason=reason,
                notes=item.get('notes', ''),
                user=request.user
            )
        return Response({'success': 'Stok berhasil diperbarui.'}, status=status.HTTP_200_OK)


class StockHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockHistory.objects.select_related('product', 'user').all().order_by('-created_at')
    serializer_class = StockHistorySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['product', 'reason', 'user']
    pagination_class = StandardResultsSetPagination
    search_fields = ['product__nama_varian', 'product__produk_induk__nama_produk']


class StoreInfoView(views.APIView):
    """
    API untuk mendapatkan dan memperbarui informasi toko.
    """
    def get(self, request, *args, **kwargs):
        # Ambil atau buat objek pertama, karena informasi toko hanya ada satu.
        store_info, created = StoreInfo.objects.get_or_create(id=1)
        serializer = StoreInfoSerializer(store_info)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        store_info, created = StoreInfo.objects.get_or_create(id=1)
        serializer = StoreInfoSerializer(store_info, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_date_ranges(self, time_range):
        today = timezone.now().date()
        if time_range == 'week':
            start_date = today - timedelta(days=6)
            prev_start_date = start_date - timedelta(days=7)
            prev_end_date = today - timedelta(days=7)
        elif time_range == 'month':
            start_date = today.replace(day=1)
            prev_month_last_day = start_date - timedelta(days=1)
            prev_start_date = prev_month_last_day.replace(day=1)
            prev_end_date = prev_month_last_day
        else: # today
            start_date = today
            prev_start_date = today - timedelta(days=1)
            prev_end_date = prev_start_date
        return start_date, today, prev_start_date, prev_end_date

    def _calculate_trend(self, current, previous):
        if previous > 0:
            trend = (current - previous) / previous
            trend_text = f"{'+' if trend >= 0 else ''}{trend:.0%} vs periode sebelumnya"
        elif current > 0:
            trend = 1.0
            trend_text = "Data baru"
        else:
            trend = 0.0
            trend_text = "-"
        return trend, trend_text

    def get(self, request, *args, **kwargs):
        time_range = request.query_params.get('range', 'today')
        start_date, end_date, prev_start, prev_end = self._get_date_ranges(time_range)

        # Querysets
        trx_current = Transaksi.objects.filter(created_at__date__range=[start_date, end_date], status='Selesai')
        trx_previous = Transaksi.objects.filter(created_at__date__range=[prev_start, prev_end], status='Selesai')
        details_current = DetailTransaksi.objects.filter(transaksi__in=trx_current)
        details_previous = DetailTransaksi.objects.filter(transaksi__in=trx_previous)

        # Kalkulasi KPI
        rev_current = trx_current.aggregate(total=Sum('total_setelah_diskon'))['total'] or 0
        rev_previous = trx_previous.aggregate(total=Sum('total_setelah_diskon'))['total'] or 0
        rev_trend, rev_text = self._calculate_trend(rev_current, rev_previous)

        trx_count_current = trx_current.count()
        trx_count_previous = trx_previous.count()
        trx_trend, trx_text = self._calculate_trend(trx_count_current, trx_count_previous)

        items_sold_current = details_current.aggregate(total=Sum('jumlah'))['total'] or 0
        items_sold_previous = details_previous.aggregate(total=Sum('jumlah'))['total'] or 0
        items_trend, items_text = self._calculate_trend(items_sold_current, items_sold_previous)
        
        low_stock_count = VarianProduk.objects.filter(stok__lte=F('peringatan_stok_rendah'), lacak_stok=True).count()

        payment_method_summary = list(trx_current
            .values('metode_pembayaran')
            .annotate(total=Sum('total_setelah_diskon'))
            .order_by('-total')
        )
        # Mengganti nama key agar sesuai dengan frontend
        for item in payment_method_summary:
            item['name'] = item.pop('metode_pembayaran')

        # Data Grafik Pendapatan
        revenue_chart_data = list(trx_current
            .annotate(date=TruncDay('created_at'))
            .values('date')
            .annotate(total_pendapatan=Sum('total_setelah_diskon'))
            .order_by('date')
        )
        for item in revenue_chart_data:
            item['date'] = item['date'].strftime('%d %b')

        # Produk Terlaris
        top_variants_data = DetailTransaksi.objects.filter(
            transaksi__created_at__date__gte=start_date
        ).values('varian_produk_terjual_id').annotate(
            total_sold=Sum('jumlah')
        ).order_by('-total_sold')[:5]

        # 2. Ambil ID varian dan buat dictionary untuk mapping (sudah benar)
        top_variant_ids = [item['varian_produk_terjual_id'] for item in top_variants_data]
        sold_map = {item['varian_produk_terjual_id']: item['total_sold'] for item in top_variants_data}
        
        # 3. Ambil objek VarianProduk berdasarkan ID (sudah benar)
        best_sellers_qs = VarianProduk.objects.filter(id__in=top_variant_ids)
        
        # 4. Serialisasi data (sudah benar)
        serializer = VarianProdukSerializer(best_sellers_qs, many=True)
        best_sellers_data = serializer.data
        
        # 5. TAMBAHAN: Sisipkan jumlah terjual ke setiap item
        for item in best_sellers_data:
            item['total_sold'] = sold_map.get(item['id'], 0)
        
        # 6. TAMBAHAN: Urutkan kembali berdasarkan jumlah terjual
        sorted_best_sellers = sorted(best_sellers_data, key=lambda x: x['total_sold'], reverse=True)

        recent_transactions = Transaksi.objects.filter(status='Selesai').order_by('-created_at')[:5]
        # Pastikan kita mengambil relasi produk induk
        recent_stock_changes = StockHistory.objects.exclude(
            reason=StockHistory.Reason.PENJUALAN
        ).select_related('product__produk_induk', 'user').order_by('-created_at')[:5]
        
        activities = []
        for trx in recent_transactions:
            activities.append({
                'id': f"trx-{trx.id}", 'type': 'TRANSAKSI', 'timestamp': trx.created_at,
                'user': trx.kasir.username,
                'description': f"Transaksi <strong>#{trx.nomor_transaksi.split('-')[1]}</strong> sebesar <strong>Rp {trx.total_setelah_diskon:,.0f}</strong>"
            })
        
        for stock in recent_stock_changes:
            activities.append({
                'id': f"stock-{stock.id}", 'type': stock.reason, 'timestamp': stock.created_at,
                'user': stock.user.username if stock.user else 'System',
                # PERBAIKAN DI SINI: Tampilkan nama produk induk dan varian
                'description': f"<strong>{stock.get_reason_display()}</strong> pada <strong>{stock.product.produk_induk.nama_produk} {(stock.product.nama_varian)}</strong>"
            })

        sorted_activities = sorted(activities, key=itemgetter('timestamp'), reverse=True)
        
        # Final JSON structure
        data = {
            'revenue': {'value': rev_current, 'trend': rev_trend, 'trend_text': rev_text},
            'total_transactions': {'value': trx_count_current, 'trend': trx_trend, 'trend_text': trx_text},
            'items_sold': {'value': items_sold_current, 'trend': items_trend, 'trend_text': items_text},
            'low_stock_items': {'value': low_stock_count, 'trend': 0, 'trend_text': f"{low_stock_count} item perlu di-restock"},
            'revenue_chart_data': revenue_chart_data,
            'best_sellers': sorted_best_sellers,
            'recent_activities': sorted_activities[:5], # Ambil 5 aktivitas terbaru dari gabungan
            'payment_method_summary': payment_method_summary
        }
        return Response(data)

class StockOpnameView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        items_to_adjust = request.data.get('items', [])
        for item in items_to_adjust:
            varian_id = item.get('varian_id')
            physical_count = Decimal(item.get('physical_count'))
            try:
                varian = VarianProduk.objects.get(id=varian_id)
            except VarianProduk.DoesNotExist:
                continue

            system_stock = varian.stok
            discrepancy = physical_count - system_stock

            if discrepancy != 0:
                varian.stok = physical_count
                varian.save()
                StockHistory.objects.create(
                    product=varian,
                    quantity_change=discrepancy,
                    stock_after=varian.stok,
                    reason=StockHistory.Reason.OPNAME,
                    notes=f"Sistem: {system_stock}, Fisik: {physical_count}",
                    user=request.user
                )
        return Response({'success': 'Stok opname berhasil disimpan.'}, status=status.HTTP_200_OK)
    
class TransactionCSVExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Ambil queryset yang sama dengan filter dari TransaksiViewSet
        queryset = Transaksi.objects.all().order_by('-created_at')
        # Terapkan filter tanggal jika ada di query params
        start_date = request.query_params.get('created_at__gte')
        end_date = request.query_params.get('created_at__lte')
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)

        # Buat response CSV
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="laporan_transaksi.csv"'

        writer = csv.writer(response)
        # Tulis header
        writer.writerow(['Nomor Transaksi', 'Tanggal', 'Kasir', 'Total', 'Metode Pembayaran', 'Status'])
        # Tulis data
        for trx in queryset:
            writer.writerow([
                trx.nomor_transaksi,
                trx.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                trx.kasir.username,
                trx.total_setelah_diskon,
                trx.metode_pembayaran,
                trx.status
            ])

        return response
    
class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

class CashFlowReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)

        if not all([start_date, end_date]):
            return Response({'error': 'Parameter start_date dan end_date dibutuhkan.'}, status=400)

        # --- UANG MASUK ---
        # 1. Dari Penjualan Tunai
        cash_sales = Transaksi.objects.filter(
            created_at__date__range=[start_date, end_date], 
            status='Selesai', 
            metode_pembayaran='Tunai'
        ).aggregate(total=Coalesce(Sum('total_setelah_diskon'), Value(0, output_field=DecimalField())))['total']

        # 2. Dari Pembayaran Piutang
        piutang_payments = Pembayaran.objects.filter(
            tanggal_bayar__date__range=[start_date, end_date],
            hutang_piutang__tipe='PIUTANG'
        ).aggregate(total=Coalesce(Sum('jumlah_bayar'), Value(0, output_field=DecimalField())))['total']

        total_cash_in = cash_sales + piutang_payments

        # --- UANG KELUAR ---
        # 1. Untuk Pembayaran Hutang
        hutang_payments = Pembayaran.objects.filter(
            tanggal_bayar__date__range=[start_date, end_date],
            hutang_piutang__tipe='HUTANG'
        ).aggregate(total=Coalesce(Sum('jumlah_bayar'), Value(0, output_field=DecimalField())))['total']

        # 2. Untuk Biaya Operasional
        expenses = Expense.objects.filter(
            tanggal__range=[start_date, end_date]
        ).aggregate(total=Coalesce(Sum('jumlah'), Value(0, output_field=DecimalField())))['total']

        total_cash_out = hutang_payments + expenses

        # --- SELISIH ---
        net_cash_flow = total_cash_in - total_cash_out

        data = {
            'total_cash_in': total_cash_in,
            'total_cash_out': total_cash_out,
            'net_cash_flow': net_cash_flow,
            'details': {
                'cash_sales': cash_sales,
                'piutang_payments': piutang_payments,
                'hutang_payments': hutang_payments,
                'expenses': expenses,
            }
        }
        return Response(data)
    
class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Ambil 5 transaksi terakhir
        recent_transactions = Transaksi.objects.filter(status='Selesai').order_by('-created_at')[:5]

        # Ambil 10 riwayat stok terakhir (di luar penjualan)
        recent_stock_changes = StockHistory.objects.exclude(
            reason=StockHistory.Reason.PENJUALAN
        ).select_related('product', 'user').order_by('-created_at')[:10]

        # Ubah data ke format standar
        activities = []
        for trx in recent_transactions:
            activities.append({
                'id': f"trx-{trx.id}",
                'type': 'TRANSAKSI',
                'timestamp': trx.created_at,
                'user': trx.kasir.username,
                'description': f"Transaksi #{trx.nomor_transaksi.split('-')[1]} sebesar Rp {trx.total_setelah_diskon:,.0f}"
            })

        for stock in recent_stock_changes:
            activities.append({
                'id': f"stock-{stock.id}",
                'type': stock.reason,
                'timestamp': stock.created_at,
                'user': stock.user.username if stock.user else 'System',
                'description': f"{stock.get_reason_display()} pada {stock.product.nama_varian}"
            })

        # Urutkan semua aktivitas berdasarkan waktu
        sorted_activities = sorted(activities, key=itemgetter('timestamp'), reverse=True)

        # Kembalikan 10 aktivitas terbaru
        return Response(sorted_activities[:10])
    
class ProfitLossReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)

        if not all([start_date, end_date]):
            return Response({'error': 'Parameter start_date dan end_date dibutuhkan.'}, status=400)

        transactions_in_range = Transaksi.objects.filter(created_at__date__range=[start_date, end_date], status='Selesai')
        expenses_in_range = Expense.objects.filter(tanggal__range=[start_date, end_date])

        # 1. Hitung Penjualan Kotor
        gross_sales = transactions_in_range.aggregate(total=Coalesce(Sum('total_setelah_diskon'), Value(0, output_field=DecimalField())))['total']

        # 2. Hitung Harga Pokok Penjualan (HPP) di Python untuk menghindari error DB
        details = DetailTransaksi.objects.filter(transaksi__in=transactions_in_range).select_related('varian_produk_terjual')
        
        cogs = Decimal(0)
        for detail in details:
            purchase_price = detail.varian_produk_terjual.purchase_price or 0
            cogs += detail.jumlah * purchase_price

        # 3. Hitung Biaya Operasional
        operational_expenses_agg = expenses_in_range.aggregate(total=Coalesce(Sum('jumlah'), Value(0, output_field=DecimalField())))
        operational_expenses = operational_expenses_agg['total']
        
        # Serialisasi rincian biaya
        expense_details = ExpenseSerializer(expenses_in_range, many=True).data

        # 4. Hitung Laba
        gross_profit = gross_sales - cogs
        net_profit = gross_profit - operational_expenses

        data = {
            'gross_sales': gross_sales,
            'cogs': cogs,
            'gross_profit': gross_profit,
            'operational_expenses': operational_expenses,
            'net_profit': net_profit,
            'expense_details': expense_details,
        }
        return Response(data)
    
class PelangganViewSet(viewsets.ModelViewSet):
    """API untuk mengelola data pelanggan."""
    queryset = Pelanggan.objects.all().order_by('nama_pelanggan')
    serializer_class = PelangganSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [SearchFilter]
    search_fields = ['nama_pelanggan', 'nomor_telepon']

class RiwayatSimpananViewSet(viewsets.ReadOnlyModelViewSet):
    """API untuk melihat riwayat simpanan."""
    queryset = RiwayatSimpanan.objects.all().order_by('-created_at')
    serializer_class = RiwayatSimpananSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['pelanggan']
    pagination_class = StandardResultsSetPagination

class SetoranSimpananView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = SetoranSimpananSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Siapkan data default untuk pelanggan baru
            defaults = {
                'nomor_telepon': data.get('nomor_telepon', ''),
                'alamat': data.get('alamat', '')
            }
            
            # Logika get_or_create:
            # Cari pelanggan berdasarkan nama. Jika tidak ada, buat yang baru
            # dengan data dari 'defaults'. Jika sudah ada, 'defaults' akan diabaikan.
            pelanggan, created = Pelanggan.objects.get_or_create(
                nama_pelanggan=data['nama_pelanggan'],
                defaults=defaults
            )

            saldo_setelah = pelanggan.saldo_simpanan + data['jumlah']
            
            RiwayatSimpanan.objects.create(
                pelanggan=pelanggan,
                tipe=RiwayatSimpanan.Tipe.MASUK,
                jumlah=data['jumlah'],
                saldo_setelah=saldo_setelah,
                keterangan=data.get('keterangan', 'Setoran tunai.'),
                dicatat_oleh=request.user
            )
            
            return Response({'success': 'Setoran berhasil dicatat.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SimpananSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Ambil semua pelanggan dan hitung total saldo mereka
        all_pelanggan = Pelanggan.objects.all()
        total_saldo = sum(p.saldo_simpanan for p in all_pelanggan)

        data = {
            'total_simpanan_aktif': total_saldo,
            'jumlah_pelanggan': all_pelanggan.count()
        }
        return Response(data)
    
class PenarikanSimpananView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = PenarikanSimpananSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                pelanggan = Pelanggan.objects.get(id=data['pelanggan_id'])
            except Pelanggan.DoesNotExist:
                return Response({'error': 'Pelanggan tidak ditemukan.'}, status=404)

            # Validasi: Pastikan saldo mencukupi
            if pelanggan.saldo_simpanan < data['jumlah']:
                return Response({'error': 'Saldo simpanan tidak mencukupi.'}, status=400)

            saldo_setelah = pelanggan.saldo_simpanan - data['jumlah']

            RiwayatSimpanan.objects.create(
                pelanggan=pelanggan,
                tipe=RiwayatSimpanan.Tipe.KELUAR,
                jumlah=data['jumlah'],
                saldo_setelah=saldo_setelah,
                keterangan=data.get('keterangan', 'Penarikan tunai.'),
                dicatat_oleh=request.user
            )
            return Response({'success': 'Penarikan berhasil dicatat.'}, status=201)
        return Response(serializer.errors, status=400)
    
class KasbonHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        kasbon_id = request.query_params.get('kasbon_id')
        if not kasbon_id:
            return Response({'error': 'ID Kasbon dibutuhkan'}, status=400)

        try:
            kasbon_item = HutangPiutang.objects.get(id=kasbon_id)
        except HutangPiutang.DoesNotExist:
            return Response({'error': 'Data tidak ditemukan'}, status=404)

        # Ambil semua transaksi dan pembayaran yang terkait dengan pelanggan/supplier yang sama
        all_transactions = HutangPiutang.objects.filter(
            tipe=kasbon_item.tipe,
            pelanggan_nama=kasbon_item.pelanggan_nama,
            supplier=kasbon_item.supplier
        ).order_by('created_at')
        
        all_payments = Pembayaran.objects.filter(
            hutang_piutang__in=all_transactions
        ).order_by('tanggal_bayar')

        # Gabungkan menjadi satu timeline
        timeline = []
        for trx in all_transactions:
            timeline.append({
                'id': f'trx-{trx.id}',
                'tanggal': trx.created_at,
                'keterangan': f'{kasbon_item.tipe.capitalize()} Baru',
                'masuk': trx.total_awal,
                'keluar': 0
            })
        
        for payment in all_payments:
            timeline.append({
                'id': f'pay-{payment.id}',
                'tanggal': payment.tanggal_bayar,
                'keterangan': 'Pembayaran Cicilan',
                'masuk': 0,
                'keluar': payment.jumlah_bayar
            })

        # Urutkan timeline berdasarkan tanggal
        sorted_timeline = sorted(timeline, key=lambda x: x['tanggal'])

        return Response(sorted_timeline)