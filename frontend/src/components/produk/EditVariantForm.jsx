// src/components/produk/EditVariantForm.jsx
import React, { useState, useEffect, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../api/axios";
import Modal from "../ui/Modal";
import { useToast } from "../../hooks/useToast";
import {
  Edit,
  Tag,
  Save,
  Plus,
  Trash2,
  Warehouse,
  Truck,
  DollarSign,
  X,
  Barcode,
  Scale,
  ListPlus,
  Info,
} from "lucide-react";

const EditVariantForm = ({
  isOpen,
  onClose,
  onSuccess,
  product,
  suppliers,
}) => {
  // --- STATE DAN LOGIC (Tidak ada perubahan) ---
  const [formData, setFormData] = useState({ aturan_harga: [] });
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        nama_varian: product.nama_varian || "",
        sku: product.sku || "",
        stok: product.stok || 0,
        satuan: product.satuan || "pcs",
        purchase_price: product.purchase_price || "",
        peringatan_stok_rendah: product.peringatan_stok_rendah || 10,
        lacak_stok: product.lacak_stok,
        pemasok: product.pemasok || "",
        harga_jual_normal: product.harga_jual_normal || "",
        harga_jual_reseller: product.harga_jual_reseller || "",
        aturan_harga: product.aturan_harga || [],
      });
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: val });
  };
  const handleRuleChange = (index, event) => {
    const newRules = [...formData.aturan_harga];
    newRules[index][event.target.name] = event.target.value;
    setFormData({ ...formData, aturan_harga: newRules });
  };
  const handleAddRule = () => {
    const newRules = [
      ...formData.aturan_harga,
      { jumlah_minimal: "", harga_total_khusus: "" },
    ];
    setFormData({ ...formData, aturan_harga: newRules });
  };
  const handleDeleteRule = (index) => {
    const newRules = formData.aturan_harga.filter((_, i) => i !== index);
    setFormData({ ...formData, aturan_harga: newRules });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        nama_varian: formData.nama_varian,
        sku: formData.sku,
        stok: formData.stok,
        satuan: formData.satuan,
        purchase_price: formData.purchase_price,
        peringatan_stok_rendah: formData.peringatan_stok_rendah,
        lacak_stok: formData.lacak_stok,
        pemasok: formData.pemasok || null,
        harga_jual_normal: formData.harga_jual_normal,
        harga_jual_reseller: formData.harga_jual_reseller || null,
        aturan_harga: formData.aturan_harga,
      };
      await apiClient.put(`/products/varian-produk/${product.id}/`, payload);
      addToast(
        "success",
        <>
          Varian
          <span className="font-bold text-accent"> {product.nama_produk_induk} {formData.nama_varian}</span>
          berhasil diperbarui!
        </>
      );
      onSuccess();
    } catch (err) {
      addToast("error", <>Gagal mengupdate varian <span className="font-bold text-accent"> {product.nama_produk_induk} {formData.nama_varian}!</span></>);
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
    visible: { opacity: 1, y: 0 },
  };
  const required_field = <span className="text-error ml-1">*</span>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Varian: ${product?.nama_varian}`}
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        <div className="flex-grow max-h-[70vh] overflow-y-auto pr-3 -mr-3 pt-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Seksi Atas (Dua Kolom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri: Informasi Dasar & Inventaris */}
              <motion.div
                variants={itemVariants}
                className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl shadow-lg flex flex-col"
              >
                <div className="flex items-center gap-3 p-4 bg-primary/5 border-b border-primary/20">
                  <Tag size={20} className="text-primary" />
                  <h3 className="font-bold text-text-title">Informasi Dasar</h3>
                </div>
                <div className="p-4 space-y-4 flex-grow">
                  <div>
                    <label className="label-style">
                      Nama Varian {required_field}
                    </label>
                    <div className="relative">
                      <Tag className="input-icon-style" />
                      <input
                        name="nama_varian"
                        value={formData.nama_varian}
                        onChange={handleChange}
                        required
                        className="input-style-modern pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-style">SKU / Barcode</label>
                    <div className="relative">
                      <Barcode className="input-icon-style" />
                      <input
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        className="input-style-modern pl-10 font-mono"
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Kosongkan jika dibuat otomatis.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-style">
                        Stok {required_field}
                      </label>
                      <div className="relative">
                        <Warehouse className="input-icon-style" />
                        <input
                          name="stok"
                          type="number"
                          step="0.001"
                          value={formData.stok}
                          onChange={handleChange}
                          required
                          className="input-style-modern pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label-style">
                        Satuan {required_field}
                      </label>
                      <div className="relative">
                        <Scale className="input-icon-style" />
                        <select
                          name="satuan"
                          value={formData.satuan}
                          onChange={handleChange}
                          required
                          className="input-style-modern pl-10"
                        >
                          <option value="pcs">Pcs</option>
                          <option value="kg">Kg</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="!mt-auto pt-4">
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-light-gray/50">
                      <input
                        id="lacak_stok_edit"
                        name="lacak_stok"
                        type="checkbox"
                        checked={formData.lacak_stok}
                        onChange={handleChange}
                        className="h-5 w-5 rounded accent-primary"
                      />
                      <label
                        htmlFor="lacak_stok_edit"
                        className="text-sm font-semibold"
                      >
                        Lacak Stok Varian Ini
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Kolom Kanan: Informasi Harga & Pemasok */}
              <motion.div
                variants={itemVariants}
                className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl shadow-lg flex flex-col"
              >
                <div className="flex items-center gap-3 p-4 bg-primary/5 border-b border-primary/20">
                  <DollarSign size={20} className="text-primary" />
                  <h3 className="font-bold text-text-title">Harga & Pemasok</h3>
                </div>
                <div className="p-4 space-y-4 flex-grow">
                  <div>
                    <label className="label-style">
                      Harga Beli {required_field}
                    </label>
                    <div className="relative">
                      <DollarSign className="input-icon-style" />
                      <input
                        name="purchase_price"
                        type="number"
                        value={formData.purchase_price}
                        onChange={handleChange}
                        required
                        className="input-style-modern pl-10 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-style">
                      Harga Ecer {required_field}
                    </label>
                    <div className="relative">
                      <Tag className="input-icon-style" />
                      <input
                        name="harga_jual_normal"
                        type="number"
                        value={formData.harga_jual_normal}
                        onChange={handleChange}
                        required
                        className="input-style-modern pl-10 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-style">
                      Harga Grosir{" "}
                      <span className="font-normal text-text-secondary">
                        (Opsional)
                      </span>
                    </label>
                    <div className="relative">
                      <Tag className="input-icon-style" />
                      <input
                        name="harga_jual_reseller"
                        type="number"
                        value={formData.harga_jual_reseller}
                        onChange={handleChange}
                        className="input-style-modern pl-10 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label-style">
                      Pemasok{" "}
                      <span className="font-normal text-text-secondary">
                        (Opsional)
                      </span>
                    </label>
                    <div className="relative">
                      <Truck className="input-icon-style" />
                      <select
                        name="pemasok"
                        value={formData.pemasok}
                        onChange={handleChange}
                        className="input-style-modern pl-10"
                      >
                        <option value="">Pilih Pemasok</option>
                        {Array.isArray(suppliers) &&
                          suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nama_pemasok}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Seksi Bawah (Lebar Penuh) */}
            <motion.div
              variants={itemVariants}
              className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl shadow-lg"
            >
              <div className="flex items-center gap-3 p-4 bg-primary/5 border-b border-primary/20">
                <ListPlus size={20} className="text-primary" />
                <h3 className="font-bold text-text-title">
                  Aturan Harga Kuantitas
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {formData.aturan_harga.map((rule, index) => (
                      <motion.div
                        key={index}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="number"
                          name="jumlah_minimal"
                          placeholder="Min. Beli"
                          value={rule.jumlah_minimal}
                          onChange={(e) => handleRuleChange(index, e)}
                          className="input-style-modern flex-1 w-full"
                        />
                        <input
                          type="number"
                          name="harga_total_khusus"
                          placeholder="Harga Total"
                          value={rule.harga_total_khusus}
                          onChange={(e) => handleRuleChange(index, e)}
                          className="input-style-modern flex-1 w-full"
                        />
                        <motion.button
                          type="button"
                          onClick={() => handleDeleteRule(index)}
                          whileHover={{ scale: 1.1 }}
                          className="p-2 text-error hover:bg-error/10 rounded-full"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <motion.button
                  type="button"
                  onClick={handleAddRule}
                  whileHover={{ scale: 1.02 }}
                  className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 border-2 border-dashed border-primary/30 rounded-lg"
                >
                  <Plus size={16} /> Tambah Aturan
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="flex-shrink-0 flex justify-end items-center gap-4 pt-4 mt-4 border-t border-light-gray/30">
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 text-sm font-bold text-text-secondary bg-light-gray/50 hover:bg-light-gray/80 rounded-lg"
          >
            Batal
          </motion.button>
          <motion.button
            type="submit"
            disabled={isSaving}
            whileHover={{
              scale: 1.05,
              y: -2,
              boxShadow: `0 10px 20px -5px rgba(223, 180, 95, 0.4)`,
            }}
            whileTap={{ scale: 0.98, y: 0 }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-accent to-yellow-400 rounded-lg shadow-lg shadow-accent/30 hover:shadow-accent/50 disabled:opacity-60"
          >
            <Save size={16} />
            {isSaving ? "Menyimpan..." : "Update Varian"}
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default EditVariantForm;

// CATATAN: Definisikan kelas-kelas ini di CSS global Anda (src/index.css)
// CATATAN: Definisikan kelas-kelas ini di CSS global Anda (src/index.css)
