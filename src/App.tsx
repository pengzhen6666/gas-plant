import { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ReceiptIndianRupee, 
  Fuel, 
  FlameKindling,
  Settings,
  TrendingUp,
  PlusCircle,
  TrendingDown,
  Users,
  AlertCircle,
  BarChart3,
  PieChart,
  History,
  Activity,
  LogOut,
  Unlock,
  Lock,
  ArrowUp,
  ArrowDown,
  Package,
  Calculator
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { LoginModal } from './components/modals/LoginModal';

// --- Types ---
import type { Transaction, Sale, MerchantSummary, SettlementType, EquipmentType } from './types/index';

// --- Utils ---
import { kgToJin } from './utils/index';

// --- Components ---
import { StatCard } from './components/common/StatCard';
import { RecordModal } from './components/modals/RecordModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { DataTable } from './components/tables/DataTable';
import { SalesTable } from './components/tables/SalesTable';
import { ExpandableMerchantRow } from './components/tables/ExpandableMerchantRow';
import { EquipmentCatalog } from './components/tables/EquipmentCatalog';
import { FuelCalculator } from './components/common/FuelCalculator';




function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
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
    // Prevent duplicates in state/DB
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
        // Fallback to demo data or empty
        return;
      }
      console.log('成功读取资产库数据:', data);
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
      alert(`添加失败: ${e.message || '未知错误'}。请确保已在 Supabase 中创建 equipment_catalog 表。`); 
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

  const processPayment = async (sale: Sale, amount: number) => {
    setIsSubmitting(true);
    try {
      const newPaidAmount = Number(sale.paid_amount || 0) + amount;
      const isSettled = newPaidAmount >= Number(sale.total_price) - 0.01;
      
      const { error: saleErr } = await supabase
        .from('sales')
        .update({ 
          paid_amount: newPaidAmount,
          status: isSettled ? '已付款' : '部分付款',
          payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', sale.id);

      if (saleErr) throw saleErr;

      const { error: txErr } = await supabase.from('transactions').insert([{
        type: '收入',
        title: `销售收款(欠款还回): ${sale.customer_name}`,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        notes: `针对订单[${sale.delivery_date}]的还款`
      }]);

      if (txErr) throw txErr;

      await fetchAllData(); 
      setIsPayModalOpen(false);
      setSelectedSale(null);
    } catch (error) {
      alert('收款处理失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (item: Transaction | Sale) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const openPayModal = (sale: Sale) => {
    setSelectedSale(sale);
    setIsPayModalOpen(true);
  };

  const handleNewOrder = (name: string, phone: string, settlement_type?: SettlementType) => {
    // Find latest equipment info for this merchant
    const latestSale = sales.find(s => s.customer_name === name && s.phone === phone);
    setPrefillData({ 
      customer_name: name, 
      phone: phone, 
      settlement_type: settlement_type,
      assigned_equipment: latestSale?.assigned_equipment
    });
    setEditData(null);
    setIsModalOpen(true);
  };

  const menuItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'merchants', label: '商户中心', icon: Users },
    { id: 'equipment_prices', label: '设备资产库', icon: Package },
    { id: 'accounting', label: '收支明细', icon: ReceiptIndianRupee },
    { id: 'fuel', label: '燃油进货', icon: Fuel },
    { id: 'stoves', label: '设备采购', icon: FlameKindling },
    { id: 'history', label: '全部历史', icon: History },
    { id: 'calculator', label: '价格走势', icon: TrendingUp },
  ];


  const totalIncome = useMemo(() => transactions.filter(t => t.type === '收入').reduce((sum, t) => sum + Number(t.amount), 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type !== '收入').reduce((sum, t) => sum + Number(t.amount), 0), [transactions]);
  const netProfit = totalIncome - totalExpense;
  const profitRate = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const totalDebt = sales.reduce((sum, s) => sum + (Number(s.total_price) - Number(s.paid_amount)), 0);
  const totalOilSold = sales.reduce((sum, s) => sum + Number(s.quantity), 0);

  // Schema-unified Universal History
  const universalHistory = useMemo(() => {
    const tItems = transactions.map(t => ({
      ...t,
      source: 'transaction'
    }));
    
    const sItems = sales.map(s => ({
      id: s.id,
      date: s.delivery_date,
      title: `销售订单: ${s.customer_name}`,
      amount: Number(s.total_price),
      quantity: s.quantity.toString(),
      type: '销售录入',
      notes: s.notes || '',
      category: s.assigned_equipment || '',
      source: 'sale',
      raw: s
    }));

    return [...tItems, ...sItems].sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, sales]);

  const merchantSummaries = useMemo(() => {
    const statsMap: Record<string, MerchantSummary> = {};
    sales.forEach(sale => {
      const key = `${sale.customer_name}_${sale.phone || ''}`;
      if (!statsMap[key]) {
        statsMap[key] = {
          customer_name: sale.customer_name,
          phone: sale.phone || '',
          total_quantity: 0,
          total_amount: 0,
          total_paid: 0,
          total_debt: 0,
          records_count: 0,
          settled_count: 0,
          settlement_type: sale.settlement_type,
          assigned_equipment: sale.assigned_equipment
        };
      }
      statsMap[key].total_quantity += Number(sale.quantity);
      statsMap[key].total_amount += Number(sale.total_price);
      statsMap[key].total_paid += Number(sale.paid_amount);
      statsMap[key].total_debt = statsMap[key].total_amount - statsMap[key].total_paid;
      statsMap[key].records_count += 1;
      if (sale.status === '已付款') statsMap[key].settled_count += 1;
      if (sale.settlement_type) statsMap[key].settlement_type = sale.settlement_type;
      if (sale.assigned_equipment) statsMap[key].assigned_equipment = sale.assigned_equipment;
    });
    return Object.values(statsMap).sort((a, b) => b.total_debt - a.total_debt);
  }, [sales]);

  const urgentDebtList = useMemo(() => {
    return merchantSummaries.filter(m => m.total_debt > 0.01).slice(0, 5);
  }, [merchantSummaries]);

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
            <div className="animate-slide-up">
              <header className="mb-4 md:mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[9px] font-bold uppercase tracking-widest mb-2">
                  <Activity size={10} /> 实时数据看板
                </div>
                <h1 className="text-xl md:text-3xl font-black text-gradient tracking-tighter">财务概览</h1>
                <p className="text-slate-400 text-[10px] md:text-sm mt-1 font-medium">实时监控经营数据与资金往来流向</p>
              </header>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-10">
                <StatCard title="累计收入" value={`¥${totalIncome.toLocaleString()}`} icon={TrendingUp} colorClass="emerald-400" />
                <StatCard title="待收欠款" value={`¥${Math.max(0, totalDebt).toLocaleString()}`} icon={AlertCircle} colorClass="rose-400" />
                <StatCard title="累计销量" value={`${totalOilSold.toLocaleString()}kg`} subValue={`${kgToJin(totalOilSold).toLocaleString()}斤`} icon={BarChart3} colorClass="brand-primary" />
                <StatCard title="经营成本" value={`¥${totalExpense.toLocaleString()}`} icon={TrendingDown} colorClass="amber-400" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                <div className="glass-card p-4 md:p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    <AlertCircle size={100} />
                  </div>
                  <h3 className="text-base md:text-lg font-black mb-4 flex items-center gap-3">
                    <div className="p-2 bg-rose-400/10 rounded-lg text-rose-400"><AlertCircle size={18} /></div>
                    商户欠款红单 (前五)
                  </h3>
                  <div className="space-y-4">
                    {urgentDebtList.map((item, idx) => {
                      const oldestUnpaid = sales.find(s => s.customer_name === item.customer_name && s.status !== '已付款');
                      return (
                        <div key={idx} className="flex justify-between items-center p-4 bg-white/[0.02] rounded-2xl border border-white/[0.05] hover:bg-white/[0.05] hover:border-brand-primary/20 transition-all group/item">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white group-hover/item:text-brand-primary transition-colors">{item.customer_name}</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest">{item.phone || '无联系电话'}</p>
                          </div>
                          <div className="flex flex-col items-end ml-4">
                            <div className="text-rose-400 font-black text-lg">¥{item.total_debt.toLocaleString()}</div>
                            {oldestUnpaid && (
                              <button 
                                onClick={() => requireAuth(() => openPayModal(oldestUnpaid))}
                                className="mt-2 px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black rounded-lg hover:bg-brand-primary hover:text-white transition-all opacity-0 group-hover/item:opacity-100"
                              >
                                录入回款
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {urgentDebtList.length === 0 && (
                      <div className="text-center py-10">
                        <div className="w-16 h-16 bg-emerald-400/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Activity size={32} />
                        </div>
                        <p className="text-slate-500 font-bold">目前暂无待收欠款</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="glass-card p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    <Users size={120} />
                  </div>
                  <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                    <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary"><Users size={20} /></div>
                    活跃商户快览
                  </h3>
                  <div className="space-y-4">
                    {merchantSummaries.slice(0, 6).map((item, idx) => (
                      <ExpandableMerchantRow 
                        key={idx} 
                        merchant={item} 
                        transactions={transactions}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'merchants' && (
            <div className="animate-slide-up">
              <header className="mb-10">
                <h1 className="text-3xl md:text-5xl font-black text-gradient tracking-tighter">商户中心</h1>
                <p className="text-slate-400 text-sm mt-2 font-medium">管理商家订货记录、设备资产与进货档案</p>
              </header>
              <SalesTable 
                data={sales} 
                transactions={transactions} 
                equipmentCatalog={equipmentCatalog}
                isLoading={isLoading} 
                onEdit={(data) => requireAuth(() => openEditModal(data))} 
                onDelete={(id) => requireAuth(() => deleteSale(id))} 
                onQuickPay={(sale) => requireAuth(() => openPayModal(sale))} 
                onNewOrder={(name, phone, type) => requireAuth(() => handleNewOrder(name, phone, type))} 
              />
            </div>
          )}

          {activeTab === 'accounting' && (
            <div className="animate-slide-up">
              <header className="mb-10">
                <h1 className="text-3xl md:text-5xl font-black text-gradient tracking-tighter">收支明细</h1>
                <p className="text-slate-400 text-sm mt-2 font-medium">业务全景盈亏实时计算与资金流监控</p>
              </header>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 mb-6 md:mb-10">
                <StatCard title="累计实收" value={`¥${totalIncome.toLocaleString()}`} icon={ArrowUp} colorClass="emerald-400" />
                <StatCard title="累计支出" value={`¥${totalExpense.toLocaleString()}`} icon={ArrowDown} colorClass="rose-400" />
                <div className="col-span-2 md:col-span-1">
                  <StatCard 
                    title="净利润" 
                    value={`¥${netProfit.toLocaleString()}`} 
                    isHighlight={true}
                    icon={netProfit >= 0 ? TrendingUp : TrendingDown} 
                    colorClass={netProfit >= 0 ? "emerald-400" : "rose-400"} 
                    subValue={netProfit >= 0 ? `利润率: +${profitRate.toFixed(1)}%` : `亏损率: ${profitRate.toFixed(1)}%`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 mb-8">
                {/* Compact Assessment & Liquidity Analysis */}
                <div className="lg:col-span-1 glass-card p-4 flex md:flex-col items-center justify-between md:justify-center text-center gap-4">
                  <div className={`p-3 rounded-xl ${netProfit >= 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
                    <Activity size={24} />
                  </div>
                  <div className="flex-1 md:flex-none text-left md:text-center">
                    <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">状态评估</h4>
                    <p className={`text-base md:text-xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {netProfit >= 0 ? '盈利良好' : '当前亏损'}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-2 glass-card p-4">
                   <div className="flex items-center gap-2 mb-4">
                     <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary"><PieChart size={16} /></div>
                     <span className="text-sm font-black">资金流动性</span>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500 uppercase">流入/流出</span>
                          <span className="text-white">{(totalIncome / (totalIncome + totalExpense || 1) * 100).toFixed(1)}% / {(totalExpense / (totalIncome + totalExpense || 1) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden flex">
                          <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{width: `${(totalIncome / (totalIncome + totalExpense || 1) * 100)}%`}} />
                          <div className="h-full bg-rose-400 rounded-full ml-0.5 transition-all duration-1000" style={{width: `${(totalExpense / (totalIncome + totalExpense || 1) * 100)}%`}} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">在途 (应收)</p>
                            <p className="text-amber-400 font-black text-sm">¥{totalDebt.toLocaleString()}</p>
                         </div>
                         <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">预估结余</p>
                            <p className="text-emerald-400 font-black text-sm">¥{(netProfit + totalDebt).toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              <DataTable 
                data={transactions} 
                title="现金流详细记录" 
                isLoading={isLoading} 
                onEdit={(data: any) => requireAuth(() => openEditModal(data))} 
                onDelete={(id: any) => requireAuth(() => deleteTransaction(id))} 
              />
            </div>
          )}

          {activeTab === 'equipment_prices' && (
            <div className="animate-slide-up">
              <header className="mb-10">
                <h1 className="text-3xl md:text-5xl font-black text-gradient tracking-tighter">设备资产库</h1>
                <p className="text-slate-400 text-sm mt-2 font-medium">配置各项设备参考价值，实现资产自动化评估</p>
              </header>
              <EquipmentCatalog 
                catalog={equipmentCatalog}
                presets={equipmentPresets}
                onAdd={addCatalogItem}
                onUpdate={updateCatalogItem}
                onDelete={deleteCatalogItem}
                onAddPreset={addPreset}
                onDeletePreset={deletePreset}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-slide-up">
              <header className="mb-10">
                <h1 className="text-3xl md:text-5xl font-black text-gradient tracking-tighter">全业务档案</h1>
                <p className="text-slate-400 text-sm mt-2 font-medium">所有财务往来与订单记录的统一时间轴</p>
              </header>
              <DataTable 
                data={universalHistory} 
                title="全量业务记录" 
                isLoading={isLoading} 
                onEdit={(item: any) => {
                  if (item.source === 'sale') {
                    requireAuth(() => openEditModal(item.raw));
                  } else {
                    requireAuth(() => openEditModal(item));
                  }
                }}
                onDelete={(id: string, item: any) => {
                  if (item?.source === 'sale') {
                    requireAuth(() => deleteSale(id));
                  } else {
                    requireAuth(() => deleteTransaction(id));
                  }
                }}
              />
            </div>
          )}

          {(activeTab === 'fuel' || activeTab === 'stoves') && (
             <div className="animate-slide-up">
               <header className="mb-10">
                 <h1 className="text-3xl md:text-5xl font-black text-gradient tracking-tighter">{menuItems.find(i => i.id === activeTab)?.label}</h1>
                 <p className="text-slate-400 text-sm mt-2 font-medium">专项采购数据分析与记录管理</p>
               </header>
                <DataTable 
                  data={transactions} 
                  title="专项流水列表" 
                  isLoading={isLoading} 
                  filterType={activeTab === 'fuel' ? '燃油采购' : activeTab === 'stoves' ? '设备采购' : undefined} 
                  onEdit={(data: any) => requireAuth(() => openEditModal(data))} 
                  onDelete={(id: any) => requireAuth(() => deleteTransaction(id))} 
                />
             </div>
          )}
          {activeTab === 'calculator' && (
            <div className="h-full">
              <FuelCalculator />
            </div>
          )}
        </div>
      </main>


      {/* Floating Action Button - Optimized for Mobile */}
      <button 
        className="fixed bottom-24 md:bottom-10 right-4 md:right-10 btn-primary p-4 md:px-8 md:py-4 rounded-2xl md:rounded-[2rem] shadow-2xl z-50 group border border-white/20 backdrop-blur-md"
        onClick={() => requireAuth(() => { setPrefillData(null); setEditData(null); setIsModalOpen(true); })}
      >
        <PlusCircle size={24} className="md:size-7 group-hover:rotate-180 transition-transform duration-700 ease-in-out" /> 
        <span className="hidden md:inline text-xl ml-3 tracking-tighter font-black italic">新增记录</span>
      </button>

      <RecordModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditData(null); setPrefillData(null); }}
        onAddTransaction={addTransaction}
        onAddSale={addSale}
        onUpdateTransaction={(id: string, data: any) => updateTransaction(id, data)}
        onUpdateSale={updateSale}
        isSubmitting={isSubmitting}
        editData={editData}
        prefillData={prefillData}
        equipmentCatalog={equipmentCatalog}
      />
      <PaymentModal isOpen={isPayModalOpen} onClose={() => { setIsPayModalOpen(false); setSelectedSale(null); }} sale={selectedSale} onProcessPayment={processPayment} isSubmitting={isSubmitting} />
      
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
