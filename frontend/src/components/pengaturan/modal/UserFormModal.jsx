// src/components/pengaturan/modal/UserFormModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../../api/axios";
import { useToast } from "../../../hooks/useToast";
import Modal from "../../ui/Modal"; // Pastikan path ini benar
import { Save, X, User, Lock, Shield, UserPlus, UserCog } from "lucide-react";

const UserFormModal = ({ isOpen, onClose, onSuccess, userToEdit }) => {
  const isEditMode = !!userToEdit;
  const initialFormState = {
    username: "",
    password: "",
    role: "kasir",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          username: userToEdit.username,
          password: "",
          role: userToEdit.role,
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [isOpen, userToEdit, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditMode) {
        const payload = { role: formData.role };
        if (formData.password) {
          payload.password = formData.password;
        }
        await apiClient.patch(`/users/${userToEdit.id}/`, payload);
        addToast("success", <>Data user <span className="font-bold text-accent">{formData.username}</span> berhasil diperbarui.</>);
      } else {
        await apiClient.post("/users/", formData);
        addToast("success", <>User <span className="font-bold text-accent">{formData.username}</span> berhasil ditambahkan.</>);
      }
      onSuccess();
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Gagal menyimpan data pengguna.";
      if (errorData) {
        // Ambil pesan error pertama yang ditemukan
        const firstErrorKey = Object.keys(errorData)[0];
        errorMessage = `${firstErrorKey}: ${errorData[firstErrorKey][0]}`;
      }
      const fullError = errorData ? JSON.stringify(errorData, null, 2) : "Tidak ada detail error.";
      addToast("error", <><span className="font-bold">Gagal:</span> {errorMessage}</>, fullError);
      console.error(err.response);
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
    visible: { opacity: 1, y: 0, transition: { type: "spring" } },
  };
  const required_field = <span className="text-error ml-1">*</span>;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface backdrop-blur-xl border border-light-gray/50 rounded-2xl shadow-lg w-full max-w-lg"
      >
        <div className="flex items-center justify-between p-4 border-b border-light-gray/50">
          <div className="flex items-center gap-3">
            {isEditMode ? (
              <UserCog size={20} className="text-primary" />
            ) : (
              <UserPlus size={20} className="text-primary" />
            )}
            <div>
              <h2 className="text-lg font-bold text-text-title">
                {isEditMode ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </h2>
              {isEditMode && (
                <p className="text-xs text-text-secondary">
                  Mengubah peran untuk:{" "}
                  <span className="font-semibold text-accent">
                    {userToEdit.username}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <motion.div variants={itemVariants}>
              <label className="text-sm font-semibold text-text-main mb-2 block">
                Username {required_field}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isEditMode}
                  className="w-full pl-10 pr-3 py-2 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all
                                           disabled:bg-light-gray/50 disabled:cursor-not-allowed disabled:text-text-secondary"
                />
              </div>
            </motion.div>

            {!isEditMode && (
            <motion.div
              variants={itemVariants}
            >
              <label className="text-sm font-semibold text-text-main mb-2 block">
                Password {required_field}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditMode}
                  className="w-full pl-10 pr-3 py-2 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                />
              </div>
            </motion.div>
            )}
            
            <motion.div variants={itemVariants}>
              <label className="text-sm font-semibold text-text-main mb-2 block">
                Peran (Role) {required_field}
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2 bg-background border-2 border-light-gray rounded-lg text-text-main focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                >
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                  <option value="guest">Guest</option> 
                </select>
              </div>
            </motion.div>
          </motion.div>

          <div className="flex justify-end items-center gap-4 pt-6 mt-6 border-t border-light-gray/50">
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30 disabled:opacity-60"
            >
              <Save size={16} />
              {isSaving
                ? "Menyimpan..."
                : isEditMode
                ? "Simpan Perubahan"
                : "Simpan Pengguna"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default UserFormModal;
