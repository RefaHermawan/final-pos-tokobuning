import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import apiClient from "../api/axios";
import { useToast } from "../hooks/useToast";
import { useReactToPrint } from "react-to-print";

// Import komponen-komponen anak
import ProductSearch from "../components/kasir/ProductSearch";
import ProductGrid from "../components/kasir/ProductGrid";
import ShoppingCart from "../components/kasir/ShoppingCart";
import PaymentModal from "../components/kasir/PaymentModal";
import ReceiptModal from "../components/kasir/ReceiptModal";
import PrintableReceipt from "../components/kasir/PrintableReceipt";
import HeldTransactionsModal from "../components/kasir/HeldTransactionsModal";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import HoldNoteForm from "../components/kasir/HoldNoteForm";
import Modal from "../components/ui/Modal";

const Kasir = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [customerType, setCustomerType] = useState("normal");

  // State untuk modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);
  const [isHoldNoteModalOpen, setHoldNoteModalOpen] = useState(false);
  const [isResellerConfirmOpen, setResellerConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isDeleteHeldConfirmOpen, setDeleteHeldConfirmOpen] = useState(false);

  // State untuk data transaksi
  const [lastTransaction, setLastTransaction] = useState(null);
  const [storeInfo, setStoreInfo] = useState({});
  const [resumingTransactionId, setResumingTransactionId] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const receiptRef = useRef();
  const { addToast } = useToast();

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const catPromise = apiClient.get("/products/kategori/");
      const prodPromise = apiClient.get(
        "/products/varian-produk/?page_size=1000"
      );
      const storeInfoPromise = apiClient.get("/transactions/store-info/");

      const [catRes, prodRes, storeInfoRes] = await Promise.all([
        catPromise,
        prodPromise,
        storeInfoPromise,
      ]);

      setCategories([{ id: "", nama_kategori: "Semua" }, ...catRes.data]);
      setProducts(prodRes.data.results || prodRes.data);
      setStoreInfo(storeInfoRes.data);
    } catch (err) {
      addToast("error", "Gagal memuat data awal.");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({ page_size: 1000 });
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory)
        params.append("produk_induk__kategori", selectedCategory);

      apiClient
        .get(`/products/varian-produk/?${params.toString()}`)
        .then((response) => setProducts(response.data.results || response.data))
        .catch((err) => console.error("Gagal filter produk", err))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, selectedCategory]);

  const getPrice = (item, quantity) => {
    if (customerType === "reseller" && item.harga_jual_reseller > 0) {
      return parseFloat(item.harga_jual_reseller);
    }
    if (item.aturan_harga?.length > 0) {
      const sortedRules = [...item.aturan_harga].sort(
        (a, b) => b.jumlah_minimal - a.jumlah_minimal
      );
      for (const rule of sortedRules) {
        if (quantity >= rule.jumlah_minimal) {
          return parseFloat(rule.harga_total_khusus) / rule.jumlah_minimal;
        }
      }
    }
    return parseFloat(item.harga_jual_normal);
  };

  const addToCart = (productToAdd) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === productToAdd.id
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === productToAdd.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevItems, { ...productToAdd, qty: 1 }];
    });
  };

  const updateCartQuantity = (productId, amount) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + amount;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setResumingTransactionId(null);
    setCustomerType("normal");
  };

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = getPrice(item, item.qty);
      return total + price * item.qty;
    }, 0);
  }, [cartItems, customerType, getPrice]);

  const handleRequestHold = () => {
    if (cartItems.length > 0) {
      setHoldNoteModalOpen(true);
    }
  };

  const handleConfirmHold = async (notes) => {
    setHoldNoteModalOpen(false);
    const payload = {
      detail_items: cartItems.map((item) => ({
        varian_produk_id: item.id,
        jumlah: item.qty,
      })),
      customer_type: customerType === "reseller" ? "Reseller" : "Biasa",
      notes: notes,
    };
    try {
      if (resumingTransactionId) {
        await apiClient.patch(
          `/transactions/transaksi/${resumingTransactionId}/update_held_transaction/`,
          payload
        );
      } else {
        await apiClient.post(
          "/transactions/transaksi/hold_transaction/",
          payload
        );
      }
      addToast(
        "success",
        <>
          Transaksi berhasil{" "}
          <span className="font-bold text-success">ditahan</span>.
        </>
      );
      clearCart();
    } catch (err) {
      addToast("error", "Gagal menahan transaksi.");
    }
  };

  const handleResumeTransaction = (transaction) => {
    const resumedItems = transaction.detail_items.map((detail) => ({
      ...detail.varian_produk_terjual,
      qty: parseFloat(detail.jumlah),
    }));
    setCartItems(resumedItems);
    setResumingTransactionId(transaction.id);
    setCustomerType(
      transaction.customer_type === "Biasa" ? "normal" : "reseller"
    );
    setIsHeldModalOpen(false);
  };

  const handleCheckout = async (paymentData) => {
    const payload = {
      ...paymentData,
      detail_items: cartItems.map((item) => ({
        varian_produk_id: item.id,
        jumlah: item.qty,
      })),
      customer_type: customerType === "reseller" ? "Reseller" : "Biasa",
    };

    try {
      let response;
      if (resumingTransactionId) {
        response = await apiClient.post(
          `/transactions/transaksi/${resumingTransactionId}/resume_transaction/`,
          payload
        );
      } else {
        response = await apiClient.post("/transactions/transaksi/", payload);
      }
      setLastTransaction(response.data);
      clearCart();
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
    } catch (err) {
      addToast(
        "error",
        err.response?.data?.error || "Gagal menyimpan transaksi."
      );
    }
  };

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const handleCustomerTypeChange = (newType) => {
    if (
      newType === "reseller" &&
      customerType === "normal" &&
      cartItems.length > 0
    ) {
      setResellerConfirmOpen(true);
    } else {
      setCustomerType(newType);
    }
  };

  const handleConfirmReseller = () => {
    setCustomerType("reseller");
    setResellerConfirmOpen(false);
  };

  const handleRequestClearCart = () => {
    if (cartItems.length > 0) {
      setClearConfirmOpen(true);
    }
  };

  const handleConfirmClearCart = () => {
    clearCart();
    setClearConfirmOpen(false);
  };

  const handleRequestDeleteHeld = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteHeldConfirmOpen(true);
  };

  const handleConfirmDeleteHeld = async () => {
    if (!transactionToDelete) return;
    try {
      await apiClient.delete(
        `/transactions/transaksi/${transactionToDelete.id}/`
      );
      addToast(
        "success",
        <>
          Transaksi ditahan berhasil{" "}
          <span className="font-bold text-success">dihapus</span>.
        </>
      );
      setIsHeldModalOpen(false); // Tutup modal daftar setelah berhasil
    } catch (err) {
      addToast("error", "Gagal menghapus transaksi.");
    } finally {
      setDeleteHeldConfirmOpen(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-130px)] gap-6">
      <div className="w-2/3 flex flex-col">
        <ProductSearch
          categories={categories}
          selectedCategory={selectedCategory}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onCategoryChange={setSelectedCategory}
        />
        <div className="flex-grow bg-surface p-4 rounded-xl shadow-lg overflow-y-auto border border-light-gray">
          <ProductGrid
            products={products}
            loading={loading}
            onProductClick={addToCart}
          />
        </div>
      </div>

      <ShoppingCart
        cartItems={cartItems}
        cartTotal={cartTotal}
        onQuantityChange={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={handleRequestClearCart}
        onPayClick={() => setIsPaymentModalOpen(true)}
        customerType={customerType}
        onCustomerTypeChange={handleCustomerTypeChange}
        getPrice={getPrice}
        onHoldClick={handleRequestHold}
        onListHeldClick={() => setIsHeldModalOpen(true)}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={cartTotal}
        onSubmit={handleCheckout}
      />
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setLastTransaction(null);
        }}
        onPrint={() => window.print()}
      />
      <HeldTransactionsModal
        isOpen={isHeldModalOpen}
        onClose={() => setIsHeldModalOpen(false)}
        onResume={handleResumeTransaction}
        onDelete={handleRequestDeleteHeld}
      />
      <Modal
        isOpen={isHoldNoteModalOpen}
        onClose={() => setHoldNoteModalOpen(false)}
      >
        <HoldNoteForm
          isOpen={isHoldNoteModalOpen}
          onClose={() => setHoldNoteModalOpen(false)}
          onSubmit={handleConfirmHold}
        />
      </Modal>
      <div className="hidden print:block">
        <PrintableReceipt
          ref={receiptRef}
          transaction={lastTransaction}
          storeInfo={storeInfo}
        />
      </div>

      <ConfirmationModal
        isOpen={isClearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={handleConfirmClearCart}
        title="Kosongkan Keranjang"
        confirmText="Ya, Kosongkan"
        type="warning"
      >
        <p>Anda yakin ingin menghapus semua item dari keranjang?</p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={isResellerConfirmOpen}
        onClose={() => setResellerConfirmOpen(false)}
        onConfirm={handleConfirmReseller}
        title="Ganti Harga Reseller"
        confirmText="Ya, Ganti"
      >
        <p>
          Mengganti ke harga reseller akan menghitung ulang semua harga di
          keranjang. Lanjutkan?
        </p>
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={isDeleteHeldConfirmOpen}
        onClose={() => setDeleteHeldConfirmOpen(false)}
        onConfirm={handleConfirmDeleteHeld}
        title="Hapus Transaksi Ditahan"
        confirmText="Ya, Hapus"
        type="warning"
      >
        <p>Anda yakin ingin menghapus transaksi ini secara permanen?</p>
      </ConfirmationModal>
    </div>
  );
};

export default Kasir;
