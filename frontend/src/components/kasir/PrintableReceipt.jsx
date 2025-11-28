// src/components/kasir/PrintableReceipt.jsx
import React from 'react';

// Ganti nama prop agar sesuai dengan yang kita gunakan di Kasir.jsx (lastTransaction)
const PrintableReceipt = React.forwardRef(({ transaction, storeInfo }, ref) => {
  if (!transaction) return null;

  const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value || 0);
  const formatQuantity = (qty) => parseFloat(qty);

  return (
    <div ref={ref} className="print-receipt">
      <div className="receipt-header">
        <h2 className="store-name">{storeInfo.nama_toko}</h2>
        <p>{storeInfo.alamat}</p>
        <p>{storeInfo.telepon}</p>
      </div>
      <hr className="dashed-line" />
      <div className="receipt-info">
        <p>No: {transaction.nomor_transaksi}</p>
        <p>Kasir: {transaction.kasir.username}</p>
        <p>Tgl: {new Date(transaction.created_at).toLocaleString('id-ID')}</p>
      </div>
      <hr className="dashed-line" />
      <table className="item-table">
        <tbody>
          {transaction.detail_items.map(item => (
            <tr key={item.id}>
              <td>  
                <div className="item-line-1">
                  <span>{item.varian_produk_terjual.nama_produk_induk} {(item.varian_produk_terjual.nama_varian)}</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
                <div className="item-line-2">
                  {formatQuantity(item.jumlah)} x {formatCurrency(item.harga_saat_transaksi)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr className="dashed-line" />
      <div className="summary-section">
        <div className="summary-line"><span>Total:</span><span>{formatCurrency(transaction.total_setelah_diskon)}</span></div>
        <div className="summary-line"><span>Bayar:</span><span>{formatCurrency(transaction.jumlah_bayar)}</span></div>
        <div className="summary-line"><span>Kembali:</span><span>{formatCurrency(transaction.kembalian)}</span></div>
      </div>
      <hr className="dashed-line" />
      <div className="receipt-footer">
        <p className="thank-you">{storeInfo.footer_struk}</p>
      </div>
    </div>
  );
});

export default PrintableReceipt;