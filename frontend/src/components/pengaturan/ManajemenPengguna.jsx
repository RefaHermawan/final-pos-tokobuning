// src/components/pengaturan/ManajemenPengguna.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import UserFormModal from './modal/UserFormModal';
import ConfirmationModal from '../ui/ConfirmationModal'; // Import modal konfirmasi
import { Users, Plus, Edit, Trash2, Shield, UserCheck, Inbox, Loader } from 'lucide-react';

// --- Helper Components ---

// Badge untuk Peran Pengguna
const RoleBadge = ({ role }) => {
    const isOwner = role?.toLowerCase() === 'owner';
    const style = isOwner ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary';
    const Icon = isOwner ? Shield : UserCheck;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style}`}>
            <Icon size={14} /> {role}
        </span>
    );
};

const SkeletonItem = () => (
    <div className="flex items-center justify-between p-4 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-light-gray/50 rounded-full"></div>
            <div className="space-y-2">
                <div className="h-4 w-24 bg-light-gray/50 rounded-md"></div>
                <div className="h-3 w-32 bg-light-gray/50 rounded-md"></div>
            </div>
        </div>
        <div className="h-8 w-20 bg-light-gray/50 rounded-full"></div>
    </div>
);

const EmptyState = ({ onAddClick }) => (
    <div className="text-center py-16 text-text-secondary">
        <Inbox size={48} className="mx-auto text-secondary" />
        <h4 className="mt-4 font-bold text-text-title">Belum Ada Pengguna</h4>
        <p className="text-sm mt-1">Tambahkan pengguna pertama untuk mulai mengelola akses.</p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onAddClick} className="mt-4 flex items-center mx-auto gap-2 px-5 py-2 text-sm font-bold text-white bg-accent rounded-lg shadow-lg shadow-accent/30">
            <Plus size={16} /> Tambah Pengguna
        </motion.button>
    </div>
);

// --- Komponen Utama ---

const ManajemenPengguna = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { addToast } = useToast();

  const fetchUsers = () => {
    setLoading(true);
    apiClient.get('/users/')
      .then(res => setUsers(res.data.results || res.data))
      .catch(() => addToast("error", "Gagal memuat data pengguna."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers() }, []);

  const handleSuccess = () => {
    setModalOpen(false);
    fetchUsers();
  };
  
  const handleOpenModal = (user = null) => {
    setSelectedUser(user);
    setModalOpen(true);
  };
  
  // Membuka modal konfirmasi
  const handleDelete = (user) => {
    setUserToDelete(user);
    setConfirmModalOpen(true);
  };
  
  // Aksi setelah konfirmasi
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await apiClient.delete(`/users/${userToDelete.id}/`);
      addToast("success", <>Pengguna <span className="font-bold text-accent">{userToDelete.username}</span> berhasil dihapus.</>);
      fetchUsers();
    } catch (err) {
      addToast("error", <>Gagal menghapus pengguna <span className="font-bold text-accent">{userToDelete.username}</span>.</>);
    } finally {
        setConfirmModalOpen(false);
        setUserToDelete(null);
    }
  };
  
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <>
      <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg"
      >
        {/* Header Kartu & Tombol Aksi */}
        <div className="p-4 border-b border-light-gray/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-center gap-3">
                <Users size={20} className="text-primary"/>
                <h2 className="text-lg font-bold text-text-title">Manajemen Pengguna & Peran</h2>
            </div>
            <motion.button onClick={() => handleOpenModal()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-accent rounded-lg shadow-lg hover:shadow-accent/30">
                <Plus size={16}/> Tambah Pengguna
            </motion.button>
        </div>

        {/* Daftar Pengguna (Responsif) */}
        <div>
            {loading ? (
                <div className="p-4 space-y-2">{Array.from({ length: 3 }).map((_, i) => <SkeletonItem key={i} />)}</div>
            ) : users.length === 0 ? (
                <EmptyState onAddClick={() => handleOpenModal()} />
            ) : (
                <AnimatePresence>
                    {users.map(user => (
                        <motion.div
                            key={user.id}
                            layout
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, x: -50 }}
                            className="flex items-center justify-between p-4 border-b border-light-gray/50 last:border-b-0 odd:bg-transparent even:bg-light-gray/25 hover:bg-primary/10 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-text-title">{user.username}</p>
                                    <p className="text-xs text-text-secondary">Bergabung: {new Date(user.date_joined).toLocaleDateString('id-ID')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <RoleBadge role={user.role} />
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenModal(user)} title="Edit Peran" className="p-2 text-accent hover:bg-accent/10 rounded-full"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(user)} title="Hapus Pengguna" className="p-2 text-error hover:bg-error/10 rounded-full"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            )}
        </div>
      </motion.div>
      
      <UserFormModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSuccess={handleSuccess} userToEdit={selectedUser} />
      
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Pengguna"
        confirmText="Ya, Hapus"
        type="warning"
      >
        <p>Anda yakin ingin menghapus pengguna <strong className="text-text-main">{userToDelete?.username}</strong>?</p>
      </ConfirmationModal>
    </>
  );
};

export default ManajemenPengguna;