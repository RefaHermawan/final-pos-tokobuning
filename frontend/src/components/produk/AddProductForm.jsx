import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import apiClient from "../../api/axios";
import Modal from "../ui/Modal";
import { useToast } from "../../hooks/useToast";
import {
  Plus,
  Save,
  X,
  Package,
  Tag,
  Shapes,
  DollarSign,
  Truck,
  Warehouse,
  Barcode,
} from "lucide-react";

const AddProductForm = ({
  isOpen,
  onSuccess,
  onClose,
  categories,
  suppliers,
  initialData,
}) => {
  // State ini sekarang mencerminkan struktur API:
  // Produk Induk hanya punya nama & kategori.
  // Sisanya ada di dalam varian_pertama.
  const initialFormState = {
    nama_produk: "",
    kategori: "",
    varian_pertama: {
      nama_varian: "",
      sku: "",
      stok: "",
      satuan: "pcs",
      purchase_price: "",
      peringatan_stok_rendah: 10,
      lacak_stok: true,
      pemasok: "",
      harga_jual_normal: "",
      harga_jual_reseller: "",
    },
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  // Reset form setiap kali modal dibuka (dari parent)
  useEffect(() => {
    if (isOpen) {
      // Jika ada initialData (dari hasil scan), isi form
      if (initialData) {
        setFormData((prev) => ({
          ...prev,
          nama_produk: initialData.nama_produk_induk || "",
          varian_pertama: {
            ...prev.varian_pertama,
            nama_varian: initialData.nama_varian || "",
            sku: initialData.sku || "",
          },
        }));
      } else {
        // Jika tidak, reset form
        setFormData(initialFormState);
      }
    }
  }, [isOpen, initialData]);

  // Handler untuk field di level atas (Produk Induk)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk semua field di dalam varian_pertama
  const handleVarianChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      varian_pertama: { ...prev.varian_pertama, [name]: val },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Membersihkan data sebelum dikirim
    const payload = {
      ...formData,
      varian_pertama: {
        ...formData.varian_pertama,
        pemasok: formData.varian_pertama.pemasok || null,
        harga_jual_reseller:
          formData.varian_pertama.harga_jual_reseller || null,
      },
    };

    try {
      await apiClient.post("/products/produk/", payload);
      addToast(
        "success",
        <>
          Produk <span className="font-bold text-accent">{formData.nama_produk}</span> berhasil ditambahkan.
        </>
      );
      onSuccess();
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage =
        errorData?.detail ||
        "Gagal menambah produk. Periksa kembali isian Anda.";
      const fullError = errorData
        ? JSON.stringify(errorData, null, 2)
        : "Tidak ada detail error dari server.";
      addToast("error", errorMessage, fullError);
      console.error(errorData);
    } finally {
      setIsSaving(false);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const required_field = <span className="text-error ml-1">*</span>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Produk & Varian Baru"
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="h-full flex flex-col ">
        <div className="flex-grow max-h-[70vh] overflow-y-auto pr-3 -mr-3 pt-4 p-2">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* 1. Seksi Info Produk Utama */}
            <motion.div
              variants={itemVariants}
              className="bg-surface backdrop-blur-sm border border-light-gray/50 rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 bg-surface border-b border-light-gray/50">
                <Package size={20} className="text-primary" />
                <h3 className="font-bold text-text-title">
                  Informasi Produk Utama
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div>
                  <label className="text-sm font-semibold text-text-main mb-1 block">
                    Nama Produk {required_field}
                  </label>
                  <input
                    name="nama_produk"
                    value={formData.nama_produk}
                    onChange={handleChange}
                    required
                    className="input-style-modern bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"
                    placeholder="Contoh: Indomie Goreng"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-text-main mb-1 block">
                    Kategori {required_field}
                  </label>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    required
                    className="input-style-modern bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"
                  >
                    <option  value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* 2. Seksi Varian & Harga (Dua Kolom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri: Varian Pertama */}
              <motion.div
                variants={itemVariants}
                className="bg-surface backdrop-blur-sm border border-light-gray/50 rounded-2xl shadow-lg flex flex-col"
              >
                <div className="flex items-center gap-3 p-4 bg-surface rounded-t-2xl border-b border-light-gray/50">
                  <Tag size={20} className="text-primary" />
                  <h3 className="font-bold text-text-title">Detail Varian</h3>
                </div>
                <div className="p-4 space-y-4 flex-grow">
                  <div>
                    <label className="text-sm font-semibold text-text-main mb-1 block">
                      Nama Varian {required_field}
                    </label>
                    <input
                      name="nama_varian"
                      value={formData.varian_pertama.nama_varian}
                      onChange={handleVarianChange}
                      required
                      className="input-style-modern bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"
                      placeholder="Contoh: Original"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-text-main mb-1 block">
                      SKU / Barcode
                    </label>
                    <input
                      name="sku"
                      value={formData.varian_pertama.sku}
                      onChange={handleVarianChange}
                      className="input-style-modern font-mono bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-text-main mb-1 block">
                        Stok Awal {required_field}
                      </label>
                      <input
                        name="stok"
                        type="number"
                        step="0.001"
                        value={formData.varian_pertama.stok}
                        onChange={handleVarianChange}
                        required
                        className="input-style-modern bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-text-main mb-1 block">
                        Satuan {required_field}
                      </label>
                      <select
                        name="satuan_dasar"
                        value={formData.varian_pertama.satuan_dasar}
                        onChange={handleVarianChange}
                        required
                        className="input-style-modern bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"
                      >
                        <option value="pcs">Pcs</option>
                        <option value="kg">Kg</option>
                        <option value="bungkus">Bungkus</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border-2 border-light-gray">
                    <input
                      id="lacak_stok"
                      name="lacak_stok"
                      type="checkbox"
                      checked={formData.varian_pertama.lacak_stok}
                      onChange={handleVarianChange}
                      className="h-5 w-5 rounded accent-primary"
                    />
                    <label
                      htmlFor="lacak_stok"
                      className="text-sm font-semibold"
                    >
                      Lacak Stok
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Kolom Kanan: Informasi Harga & Pemasok */}
              <motion.div
                variants={itemVariants}
                className="bg-surface backdrop-blur-sm border border-light-gray/50 rounded-2xl shadow-lg flex flex-col"
              >
                <div className="flex items-center gap-3 p-4 bg-surface border-b border-light-gray/50 rounded-t-2xl">
                  <DollarSign size={20} className="text-primary" />
                  <h3 className="font-bold text-text-title">Harga & Pemasok</h3>
                </div>
                <div className="p-4 space-y-4 flex-grow">
                  <div>
                    <label className="text-sm font-semibold text-text-main mb-1 block">
                      Harga Beli {required_field}
                    </label>
                    <input
                      name="purchase_price"
                      type="number"
                      value={formData.varian_pertama.purchase_price}
                      onChange={handleVarianChange}
                      required
                      className="input-style-modern font-mono bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-text-main mb-1 block">
                      Harga Ecer {required_field}
                    </label>
                    <input
                      name="harga_jual_normal"
                      type="number"
                      value={formData.varian_pertama.harga_jual_normal}
                      onChange={handleVarianChange}
                      required
                      className="input-style-modern font-mono bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-text-main mb-1 block">
                      Harga Grosir{" "}
                      <span className="text-text-secondary font-normal">
                        (Opsional)
                      </span>
                    </label>
                    <input
                      name="harga_jual_reseller"
                      type="number"
                      value={formData.varian_pertama.harga_jual_reseller}
                      onChange={handleVarianChange}
                      className="input-style-modern font-mono bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-text-main mb-1 block">
                      Pemasok{" "}
                      <span className="text-text-secondary font-normal">
                        (Opsional)
                      </span>
                    </label>
                    <select
                      name="pemasok"
                      value={formData.varian_pertama.pemasok}
                      onChange={handleVarianChange}
                      className="input-style-modern bg-background border-2 border-light-gray focus:border-accent focus:ring-accent"
                    >
                      <option value="">Pilih Pemasok</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama_pemasok}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="flex-shrink-0 flex justify-end items-center gap-4 pt-4 mt-4 border-t border-light-gray/50">
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray rounded-lg"
          >
            Batal
          </motion.button>
          <motion.button
            type="submit"
            disabled={isSaving}
            whileHover={{
              scale: 1.05,
              y: -2,
            }}
            whileTap={{ scale: 0.98, y: 0 }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-accent to-yellow-400 rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60"
          >
            <Save size={16} />
            {isSaving ? "Menyimpan..." : "Simpan Produk"}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProductForm;
