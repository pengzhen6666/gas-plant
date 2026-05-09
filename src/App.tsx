import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ReceiptIndianRupee, 
  Fuel, 
  FlameKindling, 
  Settings,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Loader2,
  Users,
  AlertCircle,
  BarChart3,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Activity,
  PieChart,
  Wallet
} from 'lucide-react';
import { supabase } from './lib/supabase';

// --- Types ---
import type { Transaction, Sale, MerchantSummary, SettlementType } from './types/index';

// --- Utils ---
import { kgToJin } from './utils/index';

// --- Components ---
import { StatCard } from './components/common/StatCard';
import { RecordModal } from './components/modals/RecordModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { DataTable } from './components/tables/DataTable';
import { SalesTable } from './components/tables/SalesTable';
import { ExpandableMerchantRow } from './components/tables/ExpandableMerchantRow';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

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
    { id: 'accounting', label: '收支明细', icon: ReceiptIndianRupee },
    { id: 'fuel', label: '燃油进货', icon: Fuel },
    { id: 'stoves', label: '设备采购', icon: FlameKindling },
    { id: 'history', label: '全部历史', icon: History },
  ];

  const totalIncome = useMemo(() => transactions.filter(t => t.type === '收入').reduce((sum, t) => sum + Number(t.amount), 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type !== '收入').reduce((sum, t) => sum + Number(t.amount), 0), [transactions]);
  const netProfit = totalIncome - totalExpense;
  const profitRate = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const totalDebt = sales.reduce((sum, s) => sum + (Number(s.total_price) - Number(s.paid_amount)), 0);
  const totalOilSold = sales.reduce((sum, s) => sum + Number(s.quantity), 0);

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
    <div className="flex min-h-screen bg-bg-primary text-slate-100 font-sans">
      <aside className="w-72 bg-bg-secondary border-r border-white/5 p-8 flex flex-col gap-8 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <FlameKindling color="white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">GUS PLANT</span>
        </div>
        <nav className="flex flex-col gap-2 mt-4">
          {menuItems.map((item) => (
            <div key={item.id} className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <item.icon size={20} /> <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="nav-item"><Settings size={20} /> <span>系统设置</span></div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="animate-in fade-in duration-700">
          {activeTab === 'dashboard' && (
            <>
              <header className="mb-10">
                <h1 className="text-3xl font-bold">财务中心</h1>
                <p className="text-slate-400 mt-1">实时经营数据与资金流监控</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="累计总收入" value={`¥ ${totalIncome.toLocaleString()}`} icon={TrendingUp} colorClass="emerald-400" />
                <StatCard title="累计总欠款" value={`¥ ${Math.max(0, totalDebt).toLocaleString()}`} icon={AlertCircle} colorClass="rose-400" subValue="市场待收回资金" />
                <StatCard title="累计总用油" value={`${totalOilSold.toLocaleString()} kg (${kgToJin(totalOilSold).toLocaleString()} 斤)`} icon={BarChart3} colorClass="brand-primary" />
                <StatCard title="累计总支出" value={`¥ ${totalExpense.toLocaleString()}`} icon={TrendingDown} colorClass="amber-400" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="text-rose-400" size={20} /> 商户欠款聚合名单
                  </h3>
                  <div className="space-y-4">
                    {urgentDebtList.map((item, idx) => {
                      const oldestUnpaid = sales.find(s => s.customer_name === item.customer_name && s.status !== '已付款');
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-brand-primary/30 transition-colors group">
                          <div>
                            <p className="font-medium">{item.customer_name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">{item.phone || '无电话'}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-rose-400 font-bold text-lg">¥ {item.total_debt.toLocaleString()}</span>
                            {oldestUnpaid && (
                              <button 
                                onClick={() => openPayModal(oldestUnpaid)}
                                className="flex items-center gap-1 mt-1 px-2 py-1 bg-brand-primary/20 text-brand-primary text-[10px] font-bold rounded-md hover:bg-brand-primary hover:text-white transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Wallet size={10} /> 录入还款
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {urgentDebtList.length === 0 && <p className="text-center text-slate-500 py-4">所有商户账目已结清！</p>}
                  </div>
                  <button onClick={() => setActiveTab('merchants')} className="w-full mt-4 py-2 text-xs text-brand-primary hover:text-white transition-colors border border-brand-primary/20 rounded-lg">查看详细商户报表</button>
                </div>
                
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="text-brand-primary" size={20} /> 商户往来快览 (点击展开)
                  </h3>
                  <div className="space-y-3">
                    {merchantSummaries.slice(0, 6).map((merchant, idx) => (
                      <ExpandableMerchantRow 
                        key={idx} 
                        merchant={merchant} 
                        transactions={transactions}
                        onQuickPay={openPayModal}
                      />
                    ))}
                    {merchantSummaries.length === 0 && <p className="text-center text-slate-500 py-4">暂无商户记录</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'merchants' && (
            <>
              <header className="mb-10">
                <h1 className="text-3xl font-bold">商户中心</h1>
                <p className="text-slate-400 mt-1">管理商家订货记录与进货表</p>
              </header>
              <SalesTable data={sales} transactions={transactions} isLoading={isLoading} onEdit={openEditModal} onDelete={deleteSale} onQuickPay={openPayModal} onNewOrder={handleNewOrder} />
            </>
          )}

          {activeTab === 'accounting' && (
            <>
              <header className="mb-10">
                <h1 className="text-3xl font-bold">收支明细</h1>
                <p className="text-slate-400 mt-1">实时计算业务整体盈亏状况</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard 
                  title="累计实收收入" 
                  value={`¥ ${totalIncome.toLocaleString()}`} 
                  icon={ArrowUp} 
                  colorClass="emerald-400" 
                  subValue="所有进账总和"
                />
                <StatCard 
                  title="累计实出支出" 
                  value={`¥ ${totalExpense.toLocaleString()}`} 
                  icon={ArrowDown} 
                  colorClass="rose-400" 
                  subValue="所有开销总和"
                />
                <StatCard 
                  title="阶段盈亏净额" 
                  value={`¥ ${netProfit.toLocaleString()}`} 
                  isHighlight={true}
                  icon={netProfit >= 0 ? TrendingUp : TrendingDown} 
                  colorClass={netProfit >= 0 ? "emerald-400" : "rose-400"} 
                  subValue={netProfit >= 0 ? `盈利：+${profitRate.toFixed(1)}%` : `亏损：${profitRate.toFixed(1)}%`}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                <div className="lg:col-span-1 glass-card p-6 flex flex-col justify-center items-center text-center">
                  <div className={`p-4 rounded-full mb-4 ${netProfit >= 0 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
                    <Activity size={32} />
                  </div>
                  <h4 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">经营状态</h4>
                  <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {netProfit >= 0 ? '盈利中' : '亏损中'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 italic">基于实到现金流计算</p>
                </div>
                <div className="lg:col-span-3 glass-card p-6">
                   <div className="flex items-center gap-2 mb-6 text-white font-bold">
                     <PieChart size={18} className="text-brand-primary" /> 资金概览分析
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">收入 vs 支出 (平衡度)</span>
                          <span className="text-white font-bold">{(totalIncome / (totalIncome + totalExpense || 1) * 100).toFixed(1)}% / {(totalExpense / (totalIncome + totalExpense || 1) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
                          <div className="h-full bg-emerald-400 shadow-lg shadow-emerald-400/20" style={{width: `${(totalIncome / (totalIncome + totalExpense || 1) * 100)}%`}} />
                          <div className="h-full bg-rose-400 shadow-lg shadow-rose-400/20" style={{width: `${(totalExpense / (totalIncome + totalExpense || 1) * 100)}%`}} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[11px]">
                         <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-slate-500 mb-1">未收欠款 (潜在盈利)</p>
                            <p className="text-amber-400 font-bold text-lg">¥ {totalDebt.toLocaleString()}</p>
                         </div>
                         <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-slate-500 mb-1">预估最终利润</p>
                            <p className="text-emerald-400 font-bold text-lg">¥ {(netProfit + totalDebt).toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              <DataTable data={transactions} title="详细收支流水" isLoading={isLoading} onEdit={openEditModal} onDelete={deleteTransaction} />
            </>
          )}

          {(activeTab === 'fuel' || activeTab === 'stoves' || activeTab === 'history') && (
             <>
               <header className="mb-10 text-white">
                 <h1 className="text-3xl font-bold">{menuItems.find(i => i.id === activeTab)?.label}</h1>
                 <p className="text-slate-400 mt-1">管理相关明细</p>
               </header>
               <DataTable data={transactions} title="记录列表" isLoading={isLoading} filterType={activeTab === 'fuel' ? '燃油采购' : activeTab === 'stoves' ? '设备采购' : undefined} onEdit={openEditModal} onDelete={deleteTransaction} />
             </>
          )}
        </div>
      </main>

      <button 
        className="fixed bottom-10 right-10 btn-primary px-8 py-4 rounded-full shadow-2xl shadow-brand-primary/40 z-50 group"
        onClick={() => { setPrefillData(null); setEditData(null); setIsModalOpen(true); }}
      >
        <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" /> <span className="text-lg">新增记录</span>
      </button>

      <RecordModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditData(null); setPrefillData(null); }} onAddTransaction={addTransaction} onAddSale={addSale} onUpdateTransaction={updateTransaction} onUpdateSale={updateSale} isSubmitting={isSubmitting} editData={editData} prefillData={prefillData} />
      <PaymentModal isOpen={isPayModalOpen} onClose={() => { setIsPayModalOpen(false); setSelectedSale(null); }} sale={selectedSale} onProcessPayment={processPayment} isSubmitting={isSubmitting} />
    </div>
  );
}

export default App;
