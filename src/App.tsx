import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FlameKindling,
  Settings,
  PlusCircle,
  Users,
  Activity,
  LogOut,
  Unlock,
  Lock
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { LoginModal } from './components/modals/LoginModal';

// --- Types ---
import type { Transaction, Sale, MerchantSummary, SettlementType, EquipmentType } from './types/index';

// --- Utils ---
import { kgToJin } from './utils/index';

// --- Components ---
import { RecordModal } from './components/modals/RecordModal';
import { FuelCalculator } from './components/common/FuelCalculator';
import { FuelCalculatorInline } from './components/common/FuelCalculatorInline';
import { useFuelCalculator } from './components/common/FuelCalculator/useFuelCalculator';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { states: calcStates, actions: calcActions } = useFuelCalculator();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<Transaction | Sale | null>(null);
  const [prefillData, setPrefillData] = useState<{customer_name: string, phone: string, settlement_type?: SettlementType, assigned_equipment?: string} | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [equipmentCatalog, setEquipmentCatalog] = useState<EquipmentType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('gus_plant_auth');
    if (auth === 'true') setIsLoggedIn(true);
    fetchAllData();
    fetchCatalog();
    fetchPresets();
  }, []);

  const [equipmentPresets, setEquipmentPresets] = useState<any[]>([]);

  const fetchPresets = async () => {
    try {
      const { data, error } = await supabase.from('equipment_presets').select('*');
      if (error) {
        console.warn('Equipment presets table not found:', error.message);
        return;
      }
      if (data) setEquipmentPresets(data);
    } catch (e) { console.error(e); }
  };

  const addPreset = async (type: string, value: string, category?: string) => {
    const exists = equipmentPresets.find(p => p.type === type && p.value === value && (type !== 'model' || p.category === category));
    if (exists) return;

    try {
      const { data, error } = await supabase.from('equipment_presets').insert([{ type, value, category }]).select();
      if (error) throw error;
      if (data) setEquipmentPresets([...equipmentPresets, ...data]);
    } catch (e) { console.error('Failed to save preset:', e); }
  };

  const deletePreset = async (id: string) => {
    try {
      const { error } = await supabase.from('equipment_presets').delete().eq('id', id);
      if (error) throw error;
      setEquipmentPresets(equipmentPresets.filter(p => p.id !== id));
    } catch (e) { alert('删除预设失败'); }
  };

  const fetchCatalog = async () => {
    try {
      const { data, error } = await supabase.from('equipment_catalog').select('*').order('name');
      if (error) {
        console.warn('Equipment catalog table not found or error:', error.message);
        return;
      }
      if (data) setEquipmentCatalog(data);
    } catch (e) { console.error(e); }
  };

  const addCatalogItem = async (name: string, price: number) => {
    try {
      const { data, error } = await supabase.from('equipment_catalog').insert([{ name, price }]).select();
      if (error) throw error;
      if (data) setEquipmentCatalog([...equipmentCatalog, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e: any) { 
      console.error(e);
      alert(`添加失败: ${e.message || '未知错误'}`); 
    }
  };

  const updateCatalogItem = async (id: string, name: string, price: number) => {
    try {
      const { data, error } = await supabase.from('equipment_catalog').update({ name, price }).eq('id', id).select();
      if (error) throw error;
      if (data) setEquipmentCatalog(equipmentCatalog.map(item => item.id === id ? data[0] : item));
    } catch (e) { alert('更新失败'); }
  };

  const deleteCatalogItem = async (id: string) => {
    if (!confirm('确定删除此设备预设吗？')) return;
    try {
      const { error } = await supabase.from('equipment_catalog').delete().eq('id', id);
      if (error) throw error;
      setEquipmentCatalog(equipmentCatalog.filter(item => item.id !== id));
    } catch (e) { alert('删除失败'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('gus_plant_auth');
    setIsLoggedIn(false);
  };

  const requireAuth = (action: () => void) => {
    if (isLoggedIn) {
      action();
    } else {
      setPendingAction(() => action);
      setIsLoginModalOpen(true);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [txRes, salesRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('sales').select('*').order('delivery_date', { ascending: false })
      ]);
      if (txRes.error) throw txRes.error;
      if (salesRes.error) {
        if (salesRes.error.code !== '42P01') throw salesRes.error;
        setSales([]);
      } else {
        setSales(salesRes.data || []);
      }
      setTransactions(txRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('transactions').insert([newTx]).select();
      if (error) {
        alert('保存失败: ' + error.message);
        throw error;
      }
      if (data) { setTransactions([data[0], ...transactions]); setIsModalOpen(false); }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const updateTransaction = async (id: string, updatedTx: Omit<Transaction, 'id'>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('transactions').update(updatedTx).eq('id', id).select();
      if (error) {
        alert('修改失败: ' + error.message);
        throw error;
      }
      if (data) { setTransactions(transactions.map(t => t.id === id ? data[0] : t)); setIsModalOpen(false); setEditData(null); }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) { alert('删除失败'); }
  };

  const addSale = async (newSale: Omit<Sale, 'id'>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('sales').insert([newSale]).select();
      if (error) {
        if (error.message.includes('column "settlement_type" does not exist')) {
          const { settlement_type, ...saleWithoutType } = newSale as any;
          const { data: retryData, error: retryError } = await supabase.from('sales').insert([saleWithoutType]).select();
          if (retryError) {
            alert('保存失败: ' + retryError.message);
            throw retryError;
          }
          if (retryData) {
            await handlePostSale(retryData[0]);
          }
        } else {
          alert('保存失败: ' + error.message);
          throw error;
        }
      } else if (data) {
        await handlePostSale(data[0]);
      }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const handlePostSale = async (sale: Sale) => {
    setSales([sale, ...sales]);
    if (Number(sale.paid_amount) > 0) {
       await supabase.from('transactions').insert([{
         type: '收入',
         title: `销售收款: ${sale.customer_name}`,
         amount: Number(sale.paid_amount),
         date: sale.delivery_date,
         notes: `销售单关联收款 (方式:${sale.settlement_type || '未注明'})`
       }]);
    }
    await fetchAllData(); 
    setIsModalOpen(false);
    setPrefillData(null);
  };

  const updateSale = async (id: string, updatedSale: Omit<Sale, 'id'>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('sales').update(updatedSale).eq('id', id).select();
      if (error) {
        if (error.message.includes('column "settlement_type" does not exist')) {
           const { settlement_type, ...saleWithoutType } = updatedSale as any;
           const { data: retryData, error: retryError } = await supabase.from('sales').update(saleWithoutType).eq('id', id).select();
           if (retryError) { alert('修改失败: ' + retryError.message); throw retryError; }
           if (retryData) { await fetchAllData(); setIsModalOpen(false); setEditData(null); }
        } else {
          alert('修改失败: ' + error.message);
          throw error;
        }
      } else if (data) { 
        await fetchAllData(); 
        setIsModalOpen(false); setEditData(null); 
      }
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const deleteSale = async (id: string) => {
    if (!confirm('确定要删除这条销售记录吗？')) return;
    try {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      await fetchAllData();
    } catch (error) { alert('删除失败'); }
  };



  const menuItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'calculator', label: '价格走势', icon: TrendingUp },
  ];

  const totalIncome = useMemo(() => transactions.filter(t => t.type === '收入').reduce((sum, t) => sum + Number(t.amount), 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type !== '收入').reduce((sum, t) => sum + Number(t.amount), 0), [transactions]);
  const netProfit = totalIncome - totalExpense;

  const totalOilSold = sales.reduce((sum, s) => sum + Number(s.quantity), 0);



  return (
    <div className="flex min-h-screen bg-bg-primary text-slate-100 pb-20 md:pb-0 overflow-x-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-72 p-6 flex-col gap-8 fixed left-0 top-0 h-screen z-50">
        <div className="glass-card flex-1 flex flex-col p-6 border-white/[0.05]">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
              <FlameKindling color="white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-gradient">GUS PLANT</span>
          </div>

          <nav className="flex flex-col gap-1.5 flex-1">
            {menuItems.map((item) => (
              <div 
                key={item.id} 
                className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`} 
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-brand-primary' : ''} /> 
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/5 space-y-3 mt-4">
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-400/5 text-emerald-400 rounded-2xl border border-emerald-400/10 text-[10px] font-bold uppercase tracking-widest">
                  <Unlock size={14} /> 管理员: Pz
                </div>
                <button onClick={handleLogout} className="nav-item text-rose-400/70 hover:text-rose-400 hover:bg-rose-400/5">
                  <LogOut size={20} /> <span className="font-bold text-sm">退出管理</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="nav-item text-brand-primary hover:bg-brand-primary/5">
                <Lock size={20} /> <span className="font-bold text-sm">管理员登录</span>
              </button>
            )}
            <div className="nav-item hover:bg-white/5"><Settings size={20} /> <span className="font-bold text-sm">系统设置</span></div>
          </div>
        </div>
      </aside>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-bg-secondary/80 backdrop-blur-3xl border border-white/10 rounded-3xl flex justify-around items-center px-4 z-[100] shadow-2xl">
        {menuItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-500 flex-1 h-full rounded-2xl ${activeTab === item.id ? 'bg-white/5 text-brand-primary' : 'text-slate-500'}`}
          >
            <item.icon size={18} className={`transition-transform duration-500 ${activeTab === item.id ? 'scale-125' : ''}`} />
            <span className={`text-[9px] font-black tracking-tighter uppercase transition-all duration-500 ${activeTab === item.id ? 'opacity-100 translate-y-0' : 'opacity-60'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content Area - Expanded to fill screen width */}
      <main className="flex-1 p-4 md:p-10 md:ml-72 w-full max-w-[1800px]">
        <div>
          {activeTab === 'dashboard' && (
            <div className="animate-slide-up space-y-6">
              <header className="mb-4 md:mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[9px] font-bold uppercase tracking-widest mb-2">
                  <Activity size={10} /> 智能分析中心
                </div>
                <h1 className="text-xl md:text-3xl font-black text-gradient tracking-tighter">智能报价核算</h1>
                <p className="text-slate-400 text-[10px] md:text-sm mt-1 font-medium">实时进行多维度利润解析与进销报价决策</p>
              </header>

              <div className="grid grid-cols-1 gap-4 md:gap-8">
                <FuelCalculatorInline states={calcStates} actions={calcActions} />
              </div>
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="animate-slide-up">
              <header className="mb-10">
                <h1 className="text-3xl md:text-5xl font-black text-gradient tracking-tighter">价格趋势与分析</h1>
                <p className="text-slate-400 text-sm mt-2 font-medium">实时核算燃料进货成本与利润预测，分析历史行情走势</p>
              </header>
              <FuelCalculator />
            </div>
          )}
        </div>
      </main>



      <RecordModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditData(null); setPrefillData(null); }}
        onAddTransaction={addTransaction}
        onAddSale={(data: any) => addSale(data)}
        onUpdateTransaction={(id: string, data: any) => updateTransaction(id, data)}
        onUpdateSale={(id: string, data: any) => updateSale(id, data)}
        isSubmitting={isSubmitting}
        editData={editData}
        prefillData={prefillData}
        equipmentCatalog={equipmentCatalog}
      />

      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={() => {
          setIsLoggedIn(true);
          setIsLoginModalOpen(false);
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }} 
      />
    </div>
  );
}

export default App;
