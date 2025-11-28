import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { useToast } from '../hooks/useToast';
import PiutangTab from '../components/kasbon/PiutangTab';
import HutangTab from '../components/kasbon/HutangTab';
import SimpananTab from '../components/kasbon/SimpananTab';
import AddPiutangForm from '../components/kasbon/modal/piutang/AddPiutangForm';
import AddHutangForm from '../components/kasbon/modal/hutang/AddHutangForm';
import PaymentDetailModal from '../components/kasbon/modal/PaymentDetailModal';
import EditPiutangForm from '../components/kasbon/modal/piutang/EditPiutangForm';
import EditHutangForm from '../components/kasbon/modal/hutang/EditHutangForm';
import AddNewCustomerForm from '../components/kasbon/modal/simpanan/AddNewCustomerForm';
import AddDepositForm from '../components/kasbon/modal/simpanan/AddDepositForm';
import EditPelangganForm from '../components/kasbon/modal/simpanan/EditPelangganForm';
import AddAmountModal from '../components/kasbon/modal/AddAmountModal';
import SimpananDetailModal from '../components/kasbon/modal/simpanan/SimpananDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import { BookUser, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import Modal from '../components/ui/Modal';

const Kasbon = () => {
  // --- SEMUA STATE DAN LOGIKA TETAP SAMA ---
  const [activeTab, setActiveTab] = useState("piutang");
  const [loading, setLoading] = useState(true);
  const [piutangSummary, setPiutangSummary] = useState({});
  const [hutangSummary, setHutangSummary] = useState({});
  const [simpananSummary, setSimpananSummary] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [isAddPiutangModalOpen, setAddPiutangModalOpen] = useState(false);
  const [isAddHutangModalOpen, setAddHutangModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isEditPiutangModalOpen, setEditPiutangModalOpen] = useState(false);
  const [isEditHutangModalOpen, setEditHutangModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setNewCustomerModalOpen] = useState(false);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [isEditPelangganModalOpen, setEditPelangganModalOpen] = useState(false);
  const [isSimpananDetailModalOpen, setSimpananDetailModalOpen] = useState(false);
  const [isAddAmountModalOpen, setAddAmountModalOpen] = useState(false);
  const [selectedItemForNewAmount, setSelectedItemForNewAmount] = useState(null);
  const [selectedKasbonItem, setSelectedKasbonItem] = useState(null);
  const [selectedPelanggan, setSelectedPelanggan] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { addToast } = useToast();

  const fetchSharedData = async () => {
    setLoading(true);
    try {
      const [piutangSumRes, hutangSumRes, suppliersRes, simpananSumRes] =
        await Promise.all([
          apiClient.get("/transactions/hutang-piutang-summary/?tipe=PIUTANG"),
          apiClient.get("/transactions/hutang-piutang-summary/?tipe=HUTANG"),
          apiClient.get("/products/pemasok/"),
          apiClient.get("/transactions/simpanan-summary/"),
        ]);
      setPiutangSummary(piutangSumRes.data);
      setHutangSummary(hutangSumRes.data);
      setSuppliers(suppliersRes.data.results || suppliersRes.data);
      setSimpananSummary(simpananSumRes.data);
    } catch (err) {
      addToast("error", "Gagal memuat data ringkasan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSharedData() }, [refreshKey]);

  const onSuccessAction = () => {
    // Menutup semua modal
    setAddPiutangModalOpen(false);
    setAddHutangModalOpen(false);
    setEditPiutangModalOpen(false);
    setEditHutangModalOpen(false);
    setNewCustomerModalOpen(false);
    setDepositModalOpen(false);
    setEditPelangganModalOpen(false);
    setSimpananDetailModalOpen(false);
    setDetailModalOpen(false);
    setAddAmountModalOpen(false);
    setRefreshKey((prevKey) => prevKey + 1); // Trigger refresh
  };

  const handleSuccess = (message) => {
    addToast("success", message);
    onSuccessAction();
  };
  const handleOpenAddAmountModal = (item) => { setSelectedItemForNewAmount(item); setAddAmountModalOpen(true); };
  const handleOpenEditModal = (item) => { setSelectedKasbonItem(item); if (item.tipe === "PIUTANG") setEditPiutangModalOpen(true); else setEditHutangModalOpen(true); };
  const handleOpenDetailModal = (item) => { setSelectedKasbonItem(item); setDetailModalOpen(true); };
  const handleOpenDepositModal = (pelanggan) => { setSelectedPelanggan(pelanggan); setDepositModalOpen(true); };
  const handleOpenEditPelangganModal = (pelanggan) => { setSelectedPelanggan(pelanggan); setEditPelangganModalOpen(true); };
  const handleOpenSimpananDetail = (pelanggan) => { setSelectedPelanggan(pelanggan); setSimpananDetailModalOpen(true); };

  const tabs = [
    { id: "piutang", label: "Piutang", icon: TrendingUp },
    { id: "hutang", label: "Hutang", icon: TrendingDown },
    { id: "simpanan", label: "Simpanan", icon: Wallet },
  ];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

  return (
    <>
    <div className="relative min-h-screen">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-4 sm:p-6">
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="bg-surface backdrop-blur-sm border border-light-gray/50 p-3 rounded-2xl shadow-lg">
            <BookUser size={28} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-title">Manajemen Kasbon</h1>
            <p className="text-sm text-text-secondary mt-1">Lacak semua hutang, piutang, dan simpanan pelanggan.</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-surface backdrop-blur-md border border-light-gray/50 rounded-2xl shadow-lg">
          <div className="p-1.5 flex items-center justify-start space-x-2 overflow-x-auto border-b border-light-gray/50">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === tab.id ? 'text-white' : 'text-text-secondary hover:bg-primary/10'}`}>
                {activeTab === tab.id && (<motion.div layoutId="kasbonActiveTabPill" className="absolute inset-0 bg-primary shadow-md" style={{ borderRadius: "0.5rem" }}/>)}
                <span className="relative z-10"><tab.icon size={16} /></span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                {activeTab === "piutang" && <PiutangTab key={`piutang-${refreshKey}`} summary={piutangSummary} loading={loading} onAddClick={() => setAddPiutangModalOpen(true)} onAddTransactionClick={handleOpenAddAmountModal} onDetailClick={handleOpenDetailModal} onEditClick={handleOpenEditModal} />}
                {activeTab === "hutang" && <HutangTab key={`hutang-${refreshKey}`} summary={hutangSummary} loading={loading} onAddClick={() => setAddHutangModalOpen(true)} onAddTransactionClick={handleOpenAddAmountModal} onDetailClick={handleOpenDetailModal} onEditClick={handleOpenEditModal} />}
                {activeTab === "simpanan" && <SimpananTab key={`simpanan-${refreshKey}`} summary={simpananSummary} loading={loading} onAddCustomerClick={() => setNewCustomerModalOpen(true)} onAddDepositClick={handleOpenDepositModal} onEditClick={handleOpenEditPelangganModal} onDetailClick={handleOpenSimpananDetail} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>

      {/* Modals */}
      <Modal
        isOpen={isAddAmountModalOpen}
        onClose={() => setAddAmountModalOpen(false)}
        title="Tambah Nominal"
      >
        <AddAmountModal
          isOpen={isAddAmountModalOpen}
          onClose={() => setAddAmountModalOpen(false)}
          onSuccess={onSuccessAction}
          kasbonItem={selectedItemForNewAmount}
        />
      </Modal>

      <Modal
        isOpen={isAddPiutangModalOpen}
        onClose={() => setAddPiutangModalOpen(false)}
        title="Catat Piutang Baru"
      >
        <AddPiutangForm
          isOpen={isAddPiutangModalOpen}
          onClose={() => setAddPiutangModalOpen(false)}
          onSuccess={onSuccessAction}
        />
      </Modal>
      <Modal
        isOpen={isAddHutangModalOpen}
        onClose={() => setAddHutangModalOpen(false)}
        title="Catat Hutang Baru"
      >
        <AddHutangForm
          isOpen={isAddHutangModalOpen}
          onClose={() => setAddHutangModalOpen(false)}
          onSuccess={onSuccessAction}
          suppliers={suppliers}
        />
      </Modal>
      <EditPiutangForm
        isOpen={isEditPiutangModalOpen}
        onClose={() => setEditPiutangModalOpen(false)}
        onSuccess={onSuccessAction}
        kasbonItem={selectedKasbonItem}
      />

      <EditHutangForm
        isOpen={isEditHutangModalOpen}
        onClose={() => setEditHutangModalOpen(false)}
        onSuccess={onSuccessAction}
        kasbonItem={selectedKasbonItem}
      />

      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onSuccess={onSuccessAction}
        kasbonItem={selectedKasbonItem}
      />

      <Modal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setNewCustomerModalOpen(false)}
        title="Tambah Pelanggan & Setoran Awal"
      >
        <AddNewCustomerForm
          isOpen={isNewCustomerModalOpen}
          onClose={() => setNewCustomerModalOpen(false)}
          onSuccess={onSuccessAction}
        />
      </Modal>
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        title="Tambah Setoran"
      >
        <AddDepositForm
          isOpen={isDepositModalOpen}
          onClose={() => setDepositModalOpen(false)}
          onSuccess={onSuccessAction}
          pelanggan={selectedPelanggan}
        />
      </Modal>
      <Modal
        isOpen={isEditPelangganModalOpen}
        onClose={() => setEditPelangganModalOpen(false)}
        title="Edit Data Pelanggan"
      >
        <EditPelangganForm
          isOpen={isEditPelangganModalOpen}
          onClose={() => setEditPelangganModalOpen(false)}
          onSuccess={onSuccessAction}
          pelanggan={selectedPelanggan}
        />
      </Modal>

      <SimpananDetailModal
        isOpen={isSimpananDetailModalOpen}
        onClose={() => setSimpananDetailModalOpen(false)}
        onSuccess={onSuccessAction}
        pelanggan={selectedPelanggan}
      />
    </>
  );
};

export default Kasbon;
