import { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  UserPlus, 
  LayoutDashboard, 
  Users, 
  Pill, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  ShoppingCart, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  Wallet,
  Stethoscope,
  Activity,
  Droplets,
  HeartPulse,
  PackagePlus,
  X,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  History,
  Clock,
  UserCheck,
  RotateCcw,
  Star,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type QueueStatus = 'Menunggu' | 'Sedang Diperiksa' | 'Selesai';

interface QueueItem {
  id: string;
  patientId: string;
  name: string;
  rmNumber: string;
  status: QueueStatus;
  entryTime: string;
}

interface FinancialRecord {
  id: string;
  timestamp: string;
  patientName: string;
  subtotal: number;
  discount: number;
  total: number;
  method: 'Tunai' | 'Non-Tunai';
  items: TransactionItem[];
}

interface ClinicSettings {
  name: string;
  address: string;
  logo: string;
  adminPassword?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountThreshold: number;
}

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  icon: any;
}

interface TransactionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'service' | 'medicine';
  timestamp: string;
}

interface Patient {
  id: string;
  name: string;
  rmNumber: string;
  lastVisits: string[];
  allergies: string[];
  phone: string;
  address?: string;
  birthDate?: string;
  isMember: boolean;
  memberId?: string;
  totalSavings: number;
}

// --- Mock Data ---
const INITIAL_PATIENTS: Patient[] = [
  { 
    id: 'p1', 
    name: 'Budi Santoso', 
    rmNumber: 'RM-2023-001', 
    phone: '081234567890',
    address: 'Jl. Melati No. 5, Jakarta',
    birthDate: '1985-05-12',
    lastVisits: ['12 Okt 2023 - Cek Gula Darah', '05 Sep 2023 - Konsultasi Umum', '20 Agst 2023 - Ganti Perban'],
    allergies: ['Paracetamol', 'Penicillin'],
    isMember: true,
    memberId: 'MEM-001',
    totalSavings: 45000
  },
  { 
    id: 'p2', 
    name: 'Siti Aminah', 
    rmNumber: 'RM-2023-045', 
    phone: '089876543210',
    address: 'Vila Indah B-12, Bekasi',
    birthDate: '1992-11-20',
    lastVisits: ['01 Okt 2023 - Cek Kolesterol', '15 Sep 2023 - Konsultasi Umum'],
    allergies: ['None'],
    isMember: false,
    totalSavings: 0
  }
];

const INITIAL_MEDICINES: Medicine[] = [
  { id: 'm1', name: 'Paracetamol 500mg', category: 'Analgesik', price: 15000, stock: 45, image: 'https://picsum.photos/seed/paracetamol/200/200' },
  { id: 'm2', name: 'Vitamin C 1000mg', category: 'Suplemen', price: 35000, stock: 12, image: 'https://picsum.photos/seed/vitaminc/200/200' },
  { id: 'm3', name: 'Amoxicillin 500mg', category: 'Antibiotik', price: 45000, stock: 8, image: 'https://picsum.photos/seed/antibiotic/200/200' },
  { id: 'm4', name: 'Antasida Doen', category: 'Antasida', price: 12000, stock: 30, image: 'https://picsum.photos/seed/antacid/200/200' },
  { id: 'm5', name: 'Cetirizine', category: 'Antihistamin', price: 22000, stock: 25, image: 'https://picsum.photos/seed/cetirizine/200/200' },
  { id: 'm6', name: 'Omeprazole', category: 'Lambung', price: 28000, stock: 18, image: 'https://picsum.photos/seed/omeprazole/200/200' },
];

const SERVICES: Service[] = [
  { id: 's1', name: 'Konsultasi Dokter Umum', price: 150000, icon: Stethoscope },
  { id: 's2', name: 'Cek Darah Lengkap', price: 250000, icon: Droplets },
  { id: 's3', name: 'Cek Kolesterol', price: 75000, icon: Activity },
  { id: 's4', name: 'Ganti Perban', price: 50000, icon: HeartPulse },
];

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
  { id: 'patients', label: 'Data Pasien (CRM)', icon: Users },
  { id: 'pharmacy', label: 'Stok Obat (Farmasi)', icon: Pill },
  { id: 'queue', label: 'Antrean (Registrasi)', icon: ClipboardList },
  { id: 'reports', label: 'Laporan Keuangan', icon: BarChart3 },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [financialReports, setFinancialReports] = useState<FinancialRecord[]>([]);
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [toasts, setToasts] = useState<{id: number, message: string, type: 'success' | 'error'}[]>([]);
  
  const [settings, setSettings] = useState<ClinicSettings>({
    name: 'CuraClinic Medical Center',
    address: 'Jl. Kesehatan No. 123, Jakarta Selatan',
    logo: 'HeartPulse',
    discountType: 'percentage',
    discountValue: 10,
    discountThreshold: 100000,
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // New Patient Form State
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    phone: '',
    birthDate: '',
    address: ''
  });

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const subtotalPrice = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  
  const discountAmount = useMemo(() => {
    if (selectedPatient?.isMember && subtotalPrice >= settings.discountThreshold) {
      if (settings.discountType === 'percentage') {
        return (subtotalPrice * settings.discountValue) / 100;
      } else {
        return settings.discountValue;
      }
    }
    return 0;
  }, [subtotalPrice, selectedPatient, settings]);

  const netTotal = useMemo(() => Math.max(0, subtotalPrice - discountAmount), [subtotalPrice, discountAmount]);
  const changeAmount = useMemo(() => paymentAmount > 0 ? paymentAmount - netTotal : 0, [paymentAmount, netTotal]);

  const totalRevenue = useMemo(() => financialReports.reduce((acc, r) => acc + r.total, 0), [financialReports]);

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return [];
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.rmNumber.includes(searchTerm) ||
      p.phone.includes(searchTerm)
    );
  }, [searchTerm, patients]);

  const getStockColor = (stock: number) => {
    if (stock < 10) return 'text-red-500';
    if (stock < 25) return 'text-orange-500';
    return 'text-emerald-500';
  };

  const addToCart = (item: Service | Medicine, type: 'service' | 'medicine') => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, type, timestamp: new Date().toISOString() }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handleCheckout = (method: 'Tunai' | 'Non-Tunai') => {
    const record: FinancialRecord = {
      id: `TRX-${Date.now()}`,
      timestamp: new Date().toISOString(),
      patientName: selectedPatient?.name || 'Umum',
      subtotal: subtotalPrice,
      discount: discountAmount,
      total: netTotal,
      method: method,
      items: [...cart]
    };

    // 1. Log Financial Record
    setFinancialReports(prev => [record, ...prev]);
    
    // 2. Log Detailed Transactions
    setTransactions(prev => [...prev, ...cart.map(c => ({ ...c, timestamp: new Date().toISOString() }))]);
    
    // 3. Update Patient Savings if Member
    if (selectedPatient?.isMember) {
      setPatients(prev => prev.map(p => p.id === selectedPatient.id ? { ...p, totalSavings: p.totalSavings + discountAmount } : p));
    }

    // 4. Reduce Stock
    setMedicines(prev => prev.map(m => {
      const cartItem = cart.find(c => c.id === m.id && c.type === 'medicine');
      if (cartItem) {
        return { ...m, stock: Math.max(0, m.stock - cartItem.quantity) };
      }
      return m;
    }));

    // 5. Update Queue status if relevant
    if (selectedPatient) {
      setQueue(prev => prev.map(q => q.patientId === selectedPatient.id ? { ...q, status: 'Selesai' } : q));
    }

    // 6. Clear Cart
    setCart([]);
    setShowPaymentModal(false);
    addToast('Transaksi Berhasil Disimpan!');
  };

  const handleCancelTransaction = (recordId: string) => {
    const record = financialReports.find(r => r.id === recordId);
    if (!record) return;

    // 1. Restore Stock
    setMedicines(prev => prev.map(m => {
      const item = record.items.find(i => i.id === m.id && i.type === 'medicine');
      if (item) {
        return { ...m, stock: m.stock + item.quantity };
      }
      return m;
    }));

    // 2. Remove Financial Record
    setFinancialReports(prev => prev.filter(r => r.id !== recordId));
    
    addToast('Transaksi dibatalkan dan stok dikembalikan.', 'error');
  };

  const upgradeToMember = (patientId: string) => {
    const memId = `MEM-${String(Date.now()).slice(-3)}`;
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, isMember: true, memberId: memId } : p));
    addToast(`Pasien ditingkatkan menjadi MEMBER (${memId})`);
  };

  const registerVisit = (patient: Patient) => {
    if (queue.find(p => p.patientId === patient.id && p.status !== 'Selesai')) {
      addToast('Pasien sudah ada dalam antrean aktif.', 'error');
      return;
    }
    const newEntry: QueueItem = {
      id: `Q-${Date.now()}`,
      patientId: patient.id,
      name: patient.name,
      rmNumber: patient.rmNumber,
      status: 'Menunggu',
      entryTime: new Date().toISOString()
    };
    setQueue(prev => [...prev, newEntry]);
    setShowVisitModal(false);
    setSelectedPatient(patient);
    addToast(`Pasien ${patient.name} masuk antrean.`);
  };

  const updateQueueStatus = (id: string, newStatus: QueueStatus) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
    addToast(`Status antrean diperbarui: ${newStatus}`);
    
    // Auto-link to POS if finished
    if (newStatus === 'Selesai') {
      const item = queue.find(q => q.id === id);
      const patient = patients.find(p => p.id === item?.patientId);
      if (patient) {
        setSelectedPatient(patient);
        setSearchTerm(patient.name);
      }
    }
  };

  const handleAddNewPatient = () => {
    const newId = `p-${Date.now()}`;
    const rmNum = `RM-2026-${String(patients.length + 1).padStart(3, '0')}`;
    const newPatient: Patient = {
      id: newId,
      name: newPatientForm.name,
      rmNumber: rmNum,
      phone: newPatientForm.phone,
      address: newPatientForm.address,
      birthDate: newPatientForm.birthDate,
      lastVisits: [],
      allergies: ['None'],
      isMember: false,
      totalSavings: 0
    };

    setPatients(prev => [...prev, newPatient]);
    setSelectedPatient(newPatient);
    setSearchTerm(newPatient.name);
    setShowNewPatientModal(false);
    
    // Auto Redirect to CRM
    setActiveTab('patients');
    addToast('Pasien baru berhasil didaftarkan!', 'success');
    
    // Reset Form
    setNewPatientForm({ name: '', phone: '', birthDate: '', address: '' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="flex h-screen w-full bg-background text-text-main font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] bg-white border-r border-border-main flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
            {settings.logo === 'HeartPulse' ? <HeartPulse size={18} /> : <Stethoscope size={18} />}
          </div>
          <h1 className="font-bold text-base leading-tight truncate">{settings.name || 'MedixPOS'}</h1>
        </div>

        <nav className="flex-1 py-4 flex flex-col overflow-y-auto">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-[#F0F7FF] text-primary border-r-4 border-primary' 
                  : 'text-text-muted hover:bg-slate-50 hover:text-text-main'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-top border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
              <img src="https://picsum.photos/seed/doctor/100/100" alt="Admin" referrerPolicy="no-referrer" />
            </div>
            <div>
              <p className="text-sm font-semibold">Dr. Amelia Putri</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border-main px-5 flex items-center justify-between shrink-0 gap-5 relative">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Cari Pasien (Budi, RM-2023, 0812...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSelectedPatient(null)}
              className="w-full h-10 pl-10 pr-4 bg-[#F1F5F9] border border-border-main rounded-lg text-sm focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted outline-none"
            />
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {filteredPatients.length > 0 && !selectedPatient && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 w-full mt-2 bg-white border border-border-main shadow-xl rounded-xl z-50 overflow-hidden"
                >
                  {filteredPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPatient(p);
                        setSearchTerm(p.name);
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <div className="text-left">
                        <p className="font-bold text-sm text-text-main">{p.name}</p>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">{p.rmNumber}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowNewPatientModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-primary text-primary rounded-lg text-xs font-bold hover:bg-[#F0F7FF] transition-all whitespace-nowrap"
            >
              <Plus size={16} />
              Pasien Baru
            </button>
            <button 
              onClick={() => setShowVisitModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-all whitespace-nowrap"
            >
              <UserPlus size={16} />
              Pendaftaran
            </button>
          </div>
        </header>

        {/* Content Body Rendering Logic */}
        <div className="flex-1 overflow-y-auto p-5 pb-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Dashboard Widgets */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Pasien Hari Ini', value: 15, icon: Users, color: 'primary' },
                    { label: 'Stok Kritis', value: medicines.filter(m => m.stock < 10).length, icon: AlertTriangle, color: 'red-500' },
                    { label: 'Pendapatan (Harian)', value: formatCurrency(totalRevenue), icon: BarChart3, color: 'emerald-500' },
                    { label: 'Antrean Aktif', value: queue.length, icon: ClipboardList, color: 'orange-500' },
                  ].map((w, i) => (
                    <div key={i} className="p-5 bg-white rounded-2xl border border-border-main shadow-sm flex items-center gap-4">
                      <div className={`p-3 bg-slate-50 rounded-xl text-${w.color}`}>
                        <w.icon size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{w.label}</p>
                        <p className="text-xl font-black text-text-main">{w.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CRM Mini Profile - Persistent inside content when selecting patient */}
                {selectedPatient && (
                  <div className="bg-white border border-primary/20 rounded-2xl p-5 shadow-sm flex gap-6 relative">
                    <button onClick={() => setSelectedPatient(null)} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500"><X size={18} /></button>
                    <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 transition-transform active:scale-95 cursor-pointer">
                      <Users size={40} className="text-primary" />
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-6">
                      <div>
                        <h3 className="font-extrabold text-lg text-text-main">{selectedPatient.name}</h3>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{selectedPatient.rmNumber}</p>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5"><History size={14} className="text-primary" /> Alergi: <span className="text-red-500 font-bold">{selectedPatient.allergies.join(', ')}</span></p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">Riwayat Medis</p>
                        <div className="space-y-1.5">
                          {selectedPatient.lastVisits.map((v, i) => (
                            <div key={i} className="text-xs bg-background p-2 rounded-lg border border-slate-100 flex items-center gap-2"><Clock size={12} className="text-slate-400" />{v}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {/* Quick POS Layout */}
                  <section className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-text-main flex items-center gap-2">
                      <ShoppingCart size={16} /> Layanan & Farmasi Cepat
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {SERVICES.map(s => (
                        <button key={s.id} onClick={() => addToCart(s, 'service')} className="p-4 bg-white rounded-xl border border-border-main hover:border-primary transition-all text-center group">
                          <s.icon size={20} className="mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                          <p className="font-bold text-[11px] truncate uppercase">{s.name}</p>
                          <p className="text-primary font-black text-xs mt-1">{formatCurrency(s.price)}</p>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {medicines.slice(0, 4).map(m => (
                        <div key={m.id} className="p-3 bg-white rounded-xl border border-border-main flex items-center justify-between group hover:border-primary transition-all">
                          <div className="min-w-0">
                            <p className="font-bold text-[11px] truncate uppercase">{m.name}</p>
                            <p className={`text-[10px] font-bold ${getStockColor(m.stock)}`}>Stock: {m.stock}</p>
                          </div>
                          <button onClick={() => addToCart(m, 'medicine')} className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"><Plus size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Patients List Activity */}
                  <section className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-text-main flex items-center gap-2">
                      <Users size={16} /> Aktivitas Pasien Baru
                    </h2>
                    <div className="bg-white border border-border-main rounded-2xl divide-y">
                      {patients.map(p => (
                        <div key={p.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-xs uppercase">{p.name[0]}</div>
                            <div>
                              <p className="font-bold text-xs">{p.name}</p>
                              <p className="text-[10px] text-text-muted">{p.rmNumber}</p>
                            </div>
                          </div>
                          <button onClick={() => { setSelectedPatient(p); setSearchTerm(p.name); }} className="p-2 hover:bg-slate-50 text-primary transition-colors"><ChevronRight size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === 'pharmacy' && (
              <motion.div 
                key="pharmacy"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-text-main uppercase tracking-tight">Inventaris Obat</h2>
                  <button className="px-4 py-2 bg-secondary text-white rounded-xl text-xs font-bold shadow-md hover:opacity-90">Export Excel</button>
                </div>
                <div className="bg-white border border-border-main rounded-2xl overflow-hidden max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 border-b border-border-main text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <th className="px-6 py-4 bg-slate-50">Nama Obat</th>
                        <th className="px-6 py-4 bg-slate-50">Kategori</th>
                        <th className="px-6 py-4 bg-slate-50">Harga Jual</th>
                        <th className="px-6 py-4 bg-slate-50">Stok</th>
                        <th className="px-6 py-4 bg-slate-50 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y relative">
                      {medicines.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-sm">{m.name}</td>
                          <td className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{m.category}</td>
                          <td className="px-6 py-4 text-sm font-mono font-bold">{formatCurrency(m.price)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 ${getStockColor(m.stock)}`}>
                              {m.stock} unit
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => { setSelectedMedicine(m); setShowStockModal(true); }}
                              className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Update Stok
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div 
                key="reports"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-text-main uppercase tracking-tight">Laporan Penjualan</h2>
                  <div className="flex gap-2">
                     <input type="date" className="bg-white border px-3 py-1.5 rounded-lg text-xs font-bold outline-none" defaultValue="2023-10-27" />
                     <button className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold">Filter</button>
                  </div>
                </div>
                
                <div className="p-6 bg-emerald-500 rounded-2xl text-white shadow-xl shadow-emerald-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Total Pendapatan Terkumpul</p>
                    <p className="text-4xl font-black font-mono">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <BarChart3 size={48} className="opacity-40" />
                </div>

                <div className="bg-white border border-border-main rounded-2xl overflow-hidden max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 border-b border-border-main text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <th className="px-6 py-4 bg-slate-50">ID Transaksi</th>
                        <th className="px-6 py-4 bg-slate-50">Waktu</th>
                        <th className="px-6 py-4 bg-slate-50">Nama Pasien</th>
                        <th className="px-6 py-4 bg-slate-50">Status / Metode</th>
                        <th className="px-6 py-4 bg-slate-50 text-right">Total Bayar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-bold text-sm">
                      {financialReports.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-20 text-center opacity-30 text-[10px] uppercase font-black">Belum Ada Catatan Keuangan</td></tr>
                      ) : (
                        financialReports.map((t, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-[10px] font-mono text-text-muted">{t.id}</td>
                            <td className="px-6 py-4 text-[10px] font-mono text-text-muted">{new Date(t.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4 uppercase text-xs">
                              <div className="flex items-center gap-2">
                                {t.patientName}
                                {t.discount > 0 && <span className="text-[8px] bg-amber-50 text-amber-600 px-1 border border-amber-200 rounded">MEMBER</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] rounded-full uppercase mr-2">Lunas</span>
                               <span className="text-[10px] text-text-muted opacity-60 uppercase">{t.method}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] text-slate-400 font-mono line-through">{formatCurrency(t.subtotal)}</span>
                                <span className="font-mono text-emerald-600">{formatCurrency(t.total)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => handleCancelTransaction(t.id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Batalkan Transaksi"
                              >
                                <RotateCcw size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'patients' && (
              <motion.div 
                key="patients"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-text-main uppercase tracking-tight">Data Pasien & Riwayat Medis</h2>
                  <button 
                    onClick={() => setShowNewPatientModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Tambah Pasien Baru
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  {/* Patient List */}
                  <div className="col-span-4 bg-white border border-border-main rounded-2xl overflow-hidden divide-y">
                    <div className="p-4 bg-slate-50 space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                        <input 
                          type="text" 
                          placeholder="Cari Pasien..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full h-9 pl-9 pr-4 bg-white border border-border-main rounded-lg text-xs font-bold outline-none" 
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSearchTerm('')}
                          className={`flex-1 py-1 px-2 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${!searchTerm ? 'bg-primary text-white border-primary' : 'bg-white text-text-muted border-border-main'}`}
                        >
                          Semua
                        </button>
                        <button 
                          onClick={() => setSearchTerm('MEM-')}
                          className={`flex-1 py-1 px-2 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all ${searchTerm === 'MEM-' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-text-muted border-border-main'}`}
                        >
                          Member
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto divide-y">
                      {patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.rmNumber.includes(searchTerm) || (searchTerm === 'MEM-' && p.isMember)).map(p => (
                        <button 
                          key={p.id} 
                          onClick={() => setSelectedPatient(p)}
                          className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors ${selectedPatient?.id === p.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${p.isMember ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-primary'}`}>
                            {p.name[0]}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-sm text-text-main truncate">{p.name}</p>
                              {p.isMember && <Star size={10} className="text-amber-500 fill-amber-500" />}
                            </div>
                            <p className="text-[10px] text-text-muted font-bold tracking-wider">{p.rmNumber}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Patient Detail / CRM */}
                  <div className="col-span-8 space-y-6">
                    {selectedPatient ? (
                      <>
                        <div className="bg-white border border-border-main rounded-2xl p-6 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                                <Users size={32} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-black text-text-main">{selectedPatient.name}</h3>
                                  {selectedPatient.isMember && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-lg border border-amber-200 uppercase tracking-widest flex items-center gap-1">
                                      <Star size={10} className="fill-amber-600" /> Member Premium
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-2">{selectedPatient.rmNumber}</p>
                                <div className="flex gap-4 mt-3">
                                  <div className="text-[10px] text-text-muted uppercase tracking-widest font-black">
                                    Kontak: <span className="text-text-main block mt-0.5">{selectedPatient.phone}</span>
                                  </div>
                                  <div className="text-[10px] text-text-muted uppercase tracking-widest font-black">
                                    Tgl Lahir: <span className="text-text-main block mt-0.5">{selectedPatient.birthDate || 'N/A'}</span>
                                  </div>
                                  {selectedPatient.isMember && (
                                    <div className="text-[10px] text-amber-600 uppercase tracking-widest font-black">
                                      ID Member: <span className="text-amber-700 block mt-0.5 font-mono">{selectedPatient.memberId}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100">
                                Alergi: {selectedPatient.allergies.join(', ')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-8 border-t pt-6 grid grid-cols-3 gap-8">
                            <div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                                <History size={14} className="text-primary" /> Riwayat Kunjungan
                              </h4>
                              <div className="space-y-3">
                                {selectedPatient.lastVisits.map((v, i) => (
                                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                    <Clock size={14} className="text-slate-400" />
                                    <span className="text-xs font-medium text-text-main">{v}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                                <Pill size={14} className="text-primary" /> Resep Terakhir
                              </h4>
                              <div className="space-y-3">
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                  <p className="text-xs font-bold text-emerald-700">Paracetamol 500mg</p>
                                  <p className="text-[9px] text-emerald-600 font-bold uppercase mt-1">3x1 Sesudah Makan</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                                <ShieldCheck size={14} className="text-amber-500" /> Keuntungan Member
                              </h4>
                              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <p className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-1">Total Penghematan</p>
                                <p className="text-xl font-black text-amber-600 font-mono">{formatCurrency(selectedPatient.totalSavings || 0)}</p>
                                <p className="text-[9px] text-amber-600/60 font-bold mt-2 uppercase">Diskon otomatis aktif tiap transaksi &gt; 100rb</p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex gap-3">
                            <button 
                              onClick={() => registerVisit(selectedPatient)}
                              className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                              Daftarkan Kunjungan Baru
                            </button>
                            {!selectedPatient.isMember && (
                              <button 
                                onClick={() => upgradeToMember(selectedPatient.id)}
                                className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-amber-500/20"
                              >
                                Upgrade ke Member
                              </button>
                            )}
                            <button className="px-6 py-3 border border-border-main rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50">
                              Edit Profil
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full bg-slate-50/50 border border-dashed border-border-main rounded-2xl flex flex-col items-center justify-center p-10 text-center">
                        <Users size={48} className="text-slate-200 mb-4" />
                        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Pilih pasien untuk melihat detail rekam medis</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'queue' && (
              <motion.div 
                key="queue"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-text-main uppercase tracking-tight">Manajemen Antrean Hari Ini</h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">Total: {queue.length}</span>
                    <span className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg text-xs font-bold">Sisa: {queue.filter(q => q.status !== 'Selesai').length}</span>
                  </div>
                </div>

                <div className="bg-white border border-border-main rounded-2xl overflow-hidden">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-border-main text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <tr>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Nama Pasien</th>
                          <th className="px-6 py-4">No. RM</th>
                          <th className="px-6 py-4">Waktu Masuk</th>
                          <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y relative">
                        {queue.length === 0 ? (
                           <tr><td colSpan={5} className="px-6 py-20 text-center opacity-30 text-[10px] uppercase font-black">Antrean Kosong</td></tr>
                        ) : (
                          queue.map((q) => (
                            <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                                  q.status === 'Menunggu' ? 'bg-orange-100 text-orange-600' :
                                  q.status === 'Sedang Diperiksa' ? 'bg-primary/10 text-primary' :
                                  'bg-emerald-100 text-emerald-600'
                                }`}>
                                  {q.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-sm">{q.name}</td>
                              <td className="px-6 py-4 text-[10px] font-bold text-text-muted tracking-widest">{q.rmNumber}</td>
                              <td className="px-6 py-4 text-[11px] font-mono">{new Date(q.entryTime).toLocaleTimeString()}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {q.status === 'Menunggu' && (
                                    <button 
                                      onClick={() => updateQueueStatus(q.id, 'Sedang Diperiksa')}
                                      className="px-3 py-1.5 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                                    >
                                      Mulai Periksa
                                    </button>
                                  )}
                                  {q.status === 'Sedang Diperiksa' && (
                                    <button 
                                      onClick={() => updateQueueStatus(q.id, 'Selesai')}
                                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                                    >
                                      Selesaikan
                                    </button>
                                  )}
                                  <button onClick={() => setQueue(prev => prev.filter(item => item.id !== q.id))} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                     </tbody>
                   </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6 max-w-4xl"
              >
                <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Pengaturan Klinik</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Clinic Profile */}
                  <div className="bg-white border border-border-main rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted border-b pb-2">Profil Klinik & Struk</h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-text-muted">Nama Klinik</label>
                        <input 
                          type="text" 
                          value={settings.name} 
                          onChange={(e) => setSettings({...settings, name: e.target.value})}
                          className="w-full h-10 px-3 border border-border-main rounded-lg text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-text-muted">Alamat Klinik</label>
                        <textarea 
                          rows={2} 
                          value={settings.address}
                          onChange={(e) => setSettings({...settings, address: e.target.value})}
                          className="w-full p-3 border border-border-main rounded-lg text-sm font-bold resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* User Management */}
                  <div className="bg-white border border-border-main rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted border-b pb-2">Manajemen User</h3>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border">
                         <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs">AP</div>
                         <div className="flex-1">
                            <p className="text-xs font-bold">Admin_Amelia</p>
                            <p className="text-[9px] text-text-muted font-bold uppercase">Super Admin</p>
                         </div>
                         <button className="text-[9px] font-black text-primary uppercase border border-primary px-2 py-1 rounded-md">Edit Pass</button>
                       </div>
                       <button className="w-full py-2.5 border border-dashed border-primary/40 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/5 transition-all">
                         <Plus size={14} className="inline mr-1" /> Tambah User Baru
                       </button>
                    </div>
                  </div>

                  {/* Discount Configuration */}
                  <div className="bg-white border border-border-main rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted border-b pb-2">Konfigurasi Diskon Member</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-text-muted">Tipe Diskon</label>
                          <select 
                            value={settings.discountType}
                            onChange={(e) => setSettings({...settings, discountType: e.target.value as 'percentage' | 'fixed'})}
                            className="w-full h-10 px-3 bg-background border border-border-main rounded-lg text-xs font-bold"
                          >
                            <option value="percentage">Persentase (%)</option>
                            <option value="fixed">Nominal Tetap (Rp)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-text-muted">Nilai Diskon</label>
                          <input 
                            type="number"
                            value={settings.discountValue}
                            onChange={(e) => setSettings({...settings, discountValue: Number(e.target.value)})}
                            className="w-full h-10 px-3 border border-border-main rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-text-muted">Ambang Batas (Threshold Rp)</label>
                        <input 
                          type="number"
                          value={settings.discountThreshold}
                          onChange={(e) => setSettings({...settings, discountThreshold: Number(e.target.value)})}
                          className="w-full h-10 px-3 border border-border-main rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Backup & System */}
                  <div className="col-span-2 bg-white border border-border-main rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-text-main uppercase">Backup Database Klinik</h3>
                        <p className="text-xs text-text-muted">Unduh seluruh data pasien, stok, dan laporan keuangan dalam format JSON.</p>
                    </div>
                    <button 
                      onClick={() => {
                        const data = { patients, medicines, transactions, financialReports, settings };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `CuraClinic_Backup_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        addToast('Pencadangan Berhasil Diunduh!');
                      }}
                      className="px-6 py-3 bg-secondary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-secondary/20 hover:opacity-90"
                    >
                      Download Backup
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Fallback for other tabs */}
            {!['dashboard', 'pharmacy', 'reports', 'patients', 'queue', 'settings'].includes(activeTab) && (
              <motion.div 
                key="other" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-full flex flex-col items-center justify-center opacity-20 text-center uppercase tracking-[0.2em]"
              >
                <Settings size={64} className="mb-4 animate-spin-slow" />
                <p className="font-black text-xs">Modul Sedang Dikembangkan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar (Queue Status) */}
        <footer className="h-10 bg-white border-t border-border-main px-6 flex items-center justify-between shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-[8px] text-white font-black">{queue.length}</span>
              Pasien di Ruang Tunggu
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Pasien Sedang Diperiksa: <span className="text-text-main font-black">3</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck size={14} className="text-primary" />
            Operator: <span className="text-primary font-black">Admin_Amelia</span>
          </div>
        </footer>
      </main>

      {/* Transaction Panel (Right) */}
      <aside className="w-[300px] bg-white border-l border-border-main flex flex-col shrink-0">
        <div className="p-5 border-b border-border-main">
          <div className="flex flex-col">
            <h2 className="font-bold text-sm text-text-main">Billing Pasien</h2>
            <p className="text-[11px] text-text-muted mt-0.5">#INV-20231027-001 • Budi Santoso</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="px-1 py-1">
             {selectedPatient ? (
               <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase text-text-muted mb-0.5">Pasien Terpilih</p>
                    <div className="flex items-center gap-2">
                       <p className="font-bold text-sm truncate">{selectedPatient.name}</p>
                       {selectedPatient.isMember && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded uppercase border border-amber-200">MEMBER</span>
                       )}
                    </div>
                  </div>
                  <button onClick={() => setSelectedPatient(null)} className="p-1 hover:text-red-500 transition-colors"><X size={14}/></button>
               </div>
             ) : (
               <div className="p-3 border border-dashed border-slate-300 rounded-xl text-center">
                 <p className="text-[9px] font-bold text-text-muted uppercase">Pasien Umum / Belum Dipilih</p>
               </div>
             )}
          </div>

          <AnimatePresence initial={false}>
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                <ClipboardList className="text-text-muted mb-2" size={32} />
                <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Billing Kosong</p>
              </div>
            ) : (
              cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-main truncate text-[13px]">{item.name}</p>
                    <p className="text-[11px] font-mono font-bold text-text-muted mt-0.5">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 p-1 bg-slate-50 border border-border-main rounded-md">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center hover:text-primary active:bg-slate-200 rounded transition-colors"><Minus size={12} /></button>
                      <span className="font-mono font-bold min-w-[16px] text-center text-[12px]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center hover:text-primary active:bg-slate-200 rounded transition-colors"><Plus size={12} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-5 border-t border-border-main bg-[#F8FAFC]/80 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-text-muted">
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotalPrice)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs font-bold text-red-500">
                <span>Diskon Member</span>
                <span className="font-mono">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-primary">
              <span className="text-base font-black uppercase tracking-widest">Total Tagihan</span>
              <span className="text-2xl font-mono font-black">{formatCurrency(netTotal)}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={() => {
              setPaymentAmount(0);
              setShowPaymentModal(true);
            }}
            className="w-full py-4 bg-primary text-white rounded-xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:shadow-none uppercase tracking-widest"
          >
            BAYAR SEKARANG
          </button>

          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Tunai Cepat</p>
            <div className="grid grid-cols-2 gap-2">
              {[50000, 100000, 200000].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setPaymentAmount(amt)}
                  className="py-2 bg-[#E2E8F0] text-text-main rounded-md text-[11px] font-bold hover:bg-slate-300 transition-colors"
                >
                  {amt / 1000}rb
                </button>
              ))}
              <button 
                onClick={() => setPaymentAmount(netTotal)}
                className="py-2 bg-[#E2E8F0] text-text-main rounded-md text-[11px] font-bold hover:bg-slate-300 transition-colors"
              >
                Uang Pas
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Stock Update Modal */}
      <AnimatePresence>
        {showStockModal && selectedMedicine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStockModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-main uppercase tracking-tight">Update Inventori</h3>
                <button onClick={() => setShowStockModal(false)}><X size={20} className="text-text-muted" /></button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center text-primary font-bold">
                    <Pill size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-main">{selectedMedicine.name}</p>
                    <p className="text-[10px] text-text-muted">Stok Saat Ini: {selectedMedicine.stock}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Jumlah Stok Masuk</label>
                  <input 
                    type="number"
                    placeholder="0"
                    className="w-full h-12 px-4 bg-background border border-border-main rounded-xl text-lg font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <button 
                  onClick={() => {
                    alert('Stok Berhasil Diupdate!');
                    setShowStockModal(false);
                  }}
                  className="w-full py-3 bg-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  Konfirmasi Update
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Pop-up (Modal) */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 pb-2 flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-main">Pembayaran Kasir</h3>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-text-muted" />
                </button>
              </div>

              <div className="px-6 space-y-4 pb-6">
                <div className="p-4 bg-background rounded-xl text-center border border-border-main">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Total Tagihan</p>
                  <p className="text-2xl font-black text-primary">{formatCurrency(netTotal)}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-1">Nominal Pembayaran</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">Rp</span>
                    <input 
                      type="number"
                      value={paymentAmount || ''}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      placeholder="Input Jumlah Uang..."
                      className="w-full text-right h-12 pl-12 pr-4 bg-background border border-border-main rounded-lg text-lg font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => handleCheckout('Tunai')}
                     disabled={paymentAmount < netTotal || subtotalPrice === 0}
                     className="flex flex-col items-center justify-center p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-30"
                   >
                     <Banknote size={24} className="mb-1" />
                     <span className="text-[11px] font-black uppercase tracking-widest">Tunai</span>
                   </button>
                   <button 
                     onClick={() => handleCheckout('Non-Tunai')}
                     disabled={subtotalPrice === 0}
                     className="flex flex-col items-center justify-center p-4 bg-primary/5 text-primary border border-primary/20 rounded-xl hover:bg-primary/10 transition-all disabled:opacity-30"
                   >
                     <CreditCard size={24} className="mb-1" />
                     <span className="text-[11px] font-black uppercase tracking-widest">Non-Tunai</span>
                   </button>
                </div>

                {(paymentAmount >= netTotal && subtotalPrice > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-secondary/5 rounded-xl border border-secondary flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Kembalian</p>
                      <p className="text-lg font-black text-secondary">{formatCurrency(changeAmount)}</p>
                    </div>
                    <CheckCircle2 size={24} className="text-secondary" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification Container */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
         <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${
                  toast.type === 'success' ? 'bg-emerald-900 border-emerald-400 text-emerald-50' : 'bg-red-900 border-red-400 text-red-50'
                }`}
              >
                {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <p className="text-xs font-black uppercase tracking-widest">{toast.message}</p>
              </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* New Patient Modal */}
      <AnimatePresence>
        {showNewPatientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewPatientModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-text-main uppercase tracking-tight">Daftar Pasien Baru</h3>
                <button onClick={() => setShowNewPatientModal(false)}><X size={20} className="text-text-muted" /></button>
              </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold uppercase text-text-muted tracking-widest px-1">Nama Lengkap</label>
                    <input 
                      type="text" 
                      placeholder="Input Nama..." 
                      value={newPatientForm.name}
                      onChange={(e) => setNewPatientForm({...newPatientForm, name: e.target.value})}
                      className="w-full h-11 px-4 bg-background border border-border-main rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-text-muted tracking-widest px-1">No. HP</label>
                    <input 
                      type="text" 
                      placeholder="08..." 
                      value={newPatientForm.phone}
                      onChange={(e) => setNewPatientForm({...newPatientForm, phone: e.target.value})}
                      className="w-full h-11 px-4 bg-background border border-border-main rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-text-muted tracking-widest px-1">Tgl Lahir</label>
                    <input 
                      type="date" 
                      value={newPatientForm.birthDate}
                      onChange={(e) => setNewPatientForm({...newPatientForm, birthDate: e.target.value})}
                      className="w-full h-11 px-4 bg-background border border-border-main rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold uppercase text-text-muted tracking-widest px-1">Alamat</label>
                    <textarea 
                      rows={2} 
                      placeholder="Input Alamat..." 
                      value={newPatientForm.address}
                      onChange={(e) => setNewPatientForm({...newPatientForm, address: e.target.value})}
                      className="w-full p-4 bg-background border border-border-main rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none resize-none" 
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddNewPatient}
                  disabled={!newPatientForm.name}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:opacity-90 disabled:bg-slate-200"
                >
                  Simpan Pasien
                </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visit Registration Modal (Queue) */}
      <AnimatePresence>
        {showVisitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVisitModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-text-main uppercase tracking-tight">Pendaftaran Kunjungan</h3>
                <button onClick={() => setShowVisitModal(false)}><X size={20} className="text-text-muted" /></button>
              </div>
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" placeholder="Cari Pasien dari Database..." className="w-full h-11 pl-10 pr-4 bg-background border border-border-main rounded-xl text-sm font-bold outline-none" />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {patients.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => registerVisit(p)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:border-primary transition-all group"
                  >
                    <div className="text-left">
                      <p className="font-bold text-sm text-text-main">{p.name}</p>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">{p.rmNumber}</p>
                    </div>
                    <UserPlus size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
