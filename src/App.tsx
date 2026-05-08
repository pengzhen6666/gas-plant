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
  X,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Loader2,
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  ArrowRightLeft,
  RotateCcw
} from 'lucide-react';
import { supabase } from './lib/supabase';

// --- Types ---
type RecordType = '收入' | '支出' | '燃油采购' | '设备采购' | '销售录入';

interface Transaction {
  id: string;
  date: string;
  type: RecordType;
  title: string;
  amount: number;
  quantity?: string;
}

interface Sale {
  id: string;
  customer_name: string;
  delivery_date: string;
  quantity: number;
  total_price: number;
  paid_amount: number;
  status: '已付款' | '未付款' | '部分付款';
  payment_date?: string;
}

// --- Components ---

const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend }: any) => (
  <div className="glass-card p-6">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${colorClass}/10`}>
        <Icon size={24} className={`text-${colorClass}`} />
      </div>
      {trend !== undefined && (
        <span className={`font-semibold text-sm ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
    {subValue && <p className="text-slate-500 text-xs mt-1">{subValue}</p>}
  </div>
);

const RecordModal = ({ isOpen, onClose, onAddTransaction, onAddSale, isSubmitting }: any) => {
  const [formData, setFormData] = useState({
    type: '收入' as RecordType,
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    customer_name: '',
    total_price: '',
    paid_amount: '',
    payment_date: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === '销售录入') {
      const totalPrice = Number(formData.total_price);
      const paidAmount = Number(formData.paid_amount);
      let status: any = '未付款';
      if (paidAmount >= totalPrice) status = '已付款';
      else if (paidAmount > 0) status = '部分付款';

      onAddSale({
        customer_name: formData.customer_name,
        delivery_date: formData.date,
        quantity: Number(formData.quantity),
        total_price: totalPrice,
        paid_amount: paidAmount,
        status: status,
        payment_date: formData.payment_date || null
      });
    } else {
      onAddTransaction({
        type: formData.type,
        title: formData.title,
        amount: Number(formData.amount),
        date: formData.date,
        quantity: formData.quantity
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="glass-card w-full max-w-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">新增记录</h2>
          <X size={24} onClick={onClose} className="cursor-pointer text-slate-400 hover:text-white transition-colors" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">记录类型</label>
            <select 
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as RecordType})}
              disabled={isSubmitting}
            >
              <option value="收入">日常收入</option>
              <option value="支出">日常支出</option>
              <option value="燃油采购">燃油进货 (采购)</option>
              <option value="设备采购">设备采购 (炉灶/配件)</option>
              <option value="销售录入">销售油品 (卖给商家)</option>
            </select>
          </div>

          {formData.type === '销售录入' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">商家名称</label>
                <input 
                  type="text" 
                  className="w-full bg-bg-accent border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors"
                  placeholder="输入商家或客户名称..."
                  value={formData.customer_name}
                  onChange={e => setFormData({...formData, customer_name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">送油量 (kg)</label>
                  <input 
                    type="number" 
                    className="w-full bg-bg-accent border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">应收总金额 (¥)</label>
                  <input 
                    type="number" 
                    className="w-full bg-bg-accent border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors"
                    value={formData.total_price}
                    onChange={e => setFormData({...formData, total_price: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">已收金额 (¥)</label>
                  <input 
                    type="number" 
                    className="w-full bg-bg-accent border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors"
                    placeholder="不填默认为0"
                    value={formData.paid_amount}
                    onChange={e => setFormData({...formData, paid_amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">结款/送油日期</label>
                  <input 
                    type="date" 
                    className="w-full bg-bg-accent border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">摘要内容</label>
                <input 
                  type="text" 
                  className="w-full bg-bg-accent border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors"
                  placeholder="输入交易说明..."
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">金额 (¥)</label>
                  <input 
                    type="number" 
                    className="w-full bg-bg-accent border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                {(formData.type === '燃油采购' || formData.type === '设备采购') && (
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">数量</label>
                    <input 
                      type="text" 
                      className="w-full bg-bg-accent border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors"
                      placeholder={formData.type === '燃油采购' ? '如: 500kg' : '如: 10台'}
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">日期</label>
                <input 
                  type="date" 
                  className="w-full bg-bg-accent border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn-primary w-full justify-center py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : '确认保存'}
          </button>
        </form>
      </div>
    </div>
  );
};

const SalesTable = ({ data, isLoading }: { data: Sale[], isLoading: boolean }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 核心筛选逻辑：所有条件通过“且 (AND)”逻辑并行过滤，保证不冲突
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. 商家名称过滤
      const matchSearch = !searchTerm || item.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. 付款状态过滤
      const matchStatus = statusFilter === '全部' || item.status === statusFilter;
      
      // 3. 日期范围过滤
      const matchDate = (!startDate || item.delivery_date >= startDate) && 
                        (!endDate || item.delivery_date <= endDate);
      
      // 只有同时满足以上三个条件的记录才会被显示
      return matchSearch && matchStatus && matchDate;
    });
  }, [data, searchTerm, statusFilter, startDate, endDate]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('全部');
    setStartDate('');
    setEndDate('');
  };

  const totalQuantity = filteredData.reduce((sum, s) => sum + Number(s.quantity), 0);
  const totalAmount = filteredData.reduce((sum, s) => sum + Number(s.total_price), 0);
  const totalPaid = filteredData.reduce((sum, s) => sum + Number(s.paid_amount), 0);
  const totalDebt = totalAmount - totalPaid;

  const isFiltered = searchTerm !== '' || statusFilter !== '全部' || startDate !== '' || endDate !== '';

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Filter size={16} className="text-brand-primary" />
            高级筛选查询
          </div>
          {isFiltered && (
            <button 
              onClick={resetFilters}
              className="text-xs text-brand-primary hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              重置所有筛选
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-slate-500 ml-1">商家名称 (模糊查询)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="搜索商家..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-primary transition-colors text-white" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-500 ml-1">付款状态 (精确匹配)</label>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-primary transition-colors text-white cursor-pointer"
            >
              <option value="全部">全部状态</option>
              <option value="已付款">已付款</option>
              <option value="未付款">未付款 (欠款)</option>
              <option value="部分付款">部分付款</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-500 ml-1">日期范围 (起始)</label>
            <input 
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-primary transition-colors text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-500 ml-1">日期范围 (截止)</label>
            <input 
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-primary transition-colors text-white"
            />
          </div>
        </div>
      </div>

      {/* Summary for filtered data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 bg-brand-primary/5 border-brand-primary/20">
          <p className="text-xs text-slate-400">当前筛选累计用油量</p>
          <p className="text-xl font-bold text-white">{totalQuantity.toLocaleString()} kg</p>
        </div>
        <div className="glass-card p-4 bg-emerald-400/5 border-emerald-400/20">
          <p className="text-xs text-slate-400">当前筛选已收总额</p>
          <p className="text-xl font-bold text-emerald-400">¥ {totalPaid.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4 bg-rose-400/5 border-rose-400/20">
          <p className="text-xs text-slate-400">当前筛选欠款总额</p>
          <p className="text-xl font-bold text-rose-400">¥ {totalDebt.toLocaleString()}</p>
        </div>
        <div className="glass-card p-4 bg-white/5">
          <p className="text-xs text-slate-400">符合条件笔数</p>
          <p className="text-xl font-bold text-white">{filteredData.length} 笔</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card p-8 overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/50 backdrop-blur-sm z-10">
            <Loader2 className="animate-spin text-brand-primary" size={40} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-bottom border-white/5 text-slate-400 text-sm">
                <th className="pb-4 px-2">送油日期</th>
                <th className="pb-4 px-2">商家名称</th>
                <th className="pb-4 px-2">用油量</th>
                <th className="pb-4 px-2 text-right">应收总额</th>
                <th className="pb-4 px-2 text-right">已收</th>
                <th className="pb-4 px-2 text-right">欠款</th>
                <th className="pb-4 px-2 text-center">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="opacity-20" />
                      <p>未找到符合所有条件的记录</p>
                      <button onClick={resetFilters} className="text-xs text-brand-primary underline mt-2">重置筛选</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((sale) => {
                  const debt = sale.total_price - sale.paid_amount;
                  return (
                    <tr key={sale.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2 text-slate-400 text-sm whitespace-nowrap">{sale.delivery_date}</td>
                      <td className="py-4 px-2 font-medium text-white">{sale.customer_name}</td>
                      <td className="py-4 px-2 text-slate-300 font-mono">{sale.quantity} kg</td>
                      <td className="py-4 px-2 text-right font-semibold text-white">¥ {sale.total_price.toLocaleString()}</td>
                      <td className="py-4 px-2 text-right text-emerald-400">¥ {sale.paid_amount.toLocaleString()}</td>
                      <td className="py-4 px-2 text-right font-bold text-rose-400">¥ {debt.toLocaleString()}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          sale.status === '已付款' ? 'bg-emerald-400/10 text-emerald-400' : 
                          sale.status === '部分付款' ? 'bg-amber-400/10 text-amber-400' : 'bg-rose-400/10 text-rose-400'
                        }`}>
                          {sale.status === '已付款' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      if (error) throw error;
      if (data) {
        setTransactions([data[0], ...transactions]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('保存失败，请检查数据库连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSale = async (newSale: Omit<Sale, 'id'>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('sales').insert([newSale]).select();
      if (error) throw error;
      if (data) {
        setSales([data[0], ...sales]);
        if (newSale.paid_amount > 0) {
           await supabase.from('transactions').insert([{
             type: '收入',
             title: `销售收款: ${newSale.customer_name}`,
             amount: newSale.paid_amount,
             date: newSale.delivery_date
           }]);
           fetchTransactions(); 
        }
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding sale:', error);
      alert('保存失败，请确保 Supabase 中已创建 sales 表');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchTransactions = async () => {
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (data) setTransactions(data);
  };

  const menuItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'merchants', label: '客户账单', icon: Users },
    { id: 'accounting', label: '收支明细', icon: ReceiptIndianRupee },
    { id: 'fuel', label: '燃油进货', icon: Fuel },
    { id: 'stoves', label: '设备采购', icon: FlameKindling },
    { id: 'history', label: '全部历史', icon: History },
  ];

  const totalIncome = transactions.filter(t => t.type === '收入').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type !== '收入').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDebt = sales.reduce((sum, s) => sum + (s.total_price - s.paid_amount), 0);

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <aside className="w-72 bg-bg-secondary border-r border-white/5 p-8 flex flex-col gap-8 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <FlameKindling color="white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">GUS PLANT</span>
        </div>

        <nav className="flex flex-col gap-2 mt-4">
          {menuItems.map((item) => (
            <div 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="nav-item">
            <Settings size={20} />
            <span>系统设置</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="animate-in fade-in duration-700">
          {activeTab === 'dashboard' && (
            <>
              <header className="mb-10">
                <h1 className="text-3xl font-bold text-white">数据概览</h1>
                <p className="text-slate-400 mt-1">公司运营及债务实时监控</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <StatCard title="总收入" value={`¥ ${totalIncome.toLocaleString()}`} icon={TrendingUp} colorClass="emerald-400" />
                <StatCard title="总欠款 (应收)" value={`¥ ${totalDebt.toLocaleString()}`} icon={AlertCircle} colorClass="rose-400" subValue="待收回资金" />
                <StatCard title="总支出" value={`¥ ${totalExpense.toLocaleString()}`} icon={TrendingDown} colorClass="amber-400" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                    <AlertCircle className="text-rose-400" size={20} />
                    紧急欠款名单
                  </h3>
                  <div className="space-y-4">
                    {sales.filter(s => s.status !== '已付款').slice(0, 5).map(s => (
                      <div key={s.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="font-medium text-white">{s.customer_name}</p>
                          <p className="text-xs text-slate-400">{s.delivery_date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-rose-400 font-bold">¥ {(s.total_price - s.paid_amount).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {sales.filter(s => s.status !== '已付款').length === 0 && <p className="text-center text-slate-500 py-4">暂无欠款客户</p>}
                  </div>
                </div>
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                    <CheckCircle2 className="text-emerald-400" size={20} />
                    最近结清
                  </h3>
                  <div className="space-y-4">
                    {sales.filter(s => s.status === '已付款').slice(0, 5).map(s => (
                      <div key={s.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="font-medium text-white">{s.customer_name}</p>
                          <p className="text-xs text-slate-400">{s.delivery_date}</p>
                        </div>
                        <div className="text-right text-emerald-400 font-bold">已结清</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'merchants' && (
            <>
              <header className="mb-10">
                <h1 className="text-3xl font-bold text-white">客户账单与用油统计</h1>
                <p className="text-slate-400 mt-1">多条件并行查询，互不冲突</p>
              </header>
              <SalesTable data={sales} isLoading={isLoading} />
            </>
          )}

          {activeTab === 'accounting' && (
            <>
              <header className="mb-10 text-white">
                <h1 className="text-3xl font-bold">收支明细</h1>
                <p className="text-slate-400 mt-1">系统所有流水存档</p>
              </header>
              <DataTable data={transactions} title="收支流水" isLoading={isLoading} />
            </>
          )}

          {(activeTab === 'fuel' || activeTab === 'stoves' || activeTab === 'history') && (
             <>
               <header className="mb-10 text-white">
                 <h1 className="text-3xl font-bold">{menuItems.find(i => i.id === activeTab)?.label}</h1>
                 <p className="text-slate-400 mt-1">管理相关明细</p>
               </header>
               <DataTable 
                 data={transactions} 
                 title="记录列表" 
                 isLoading={isLoading} 
                 filterType={activeTab === 'fuel' ? '燃油采购' : activeTab === 'stoves' ? '设备采购' : undefined} 
               />
             </>
          )}
        </div>
      </main>

      <button 
        className="fixed bottom-10 right-10 btn-primary px-8 py-4 rounded-full shadow-2xl shadow-brand-primary/40 z-50 group"
        onClick={() => setIsModalOpen(true)}
      >
        <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="text-lg">新增记录</span>
      </button>

      <RecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddTransaction={addTransaction}
        onAddSale={addSale}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

const DataTable = ({ data, title, filterType, isLoading }: any) => {
  const filteredData = filterType ? data.filter((d: any) => d.type === filterType) : data;
  return (
    <div className="glass-card p-8 mb-6 overflow-hidden relative min-h-[300px]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input placeholder="搜索..." className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-primary transition-colors text-white" />
        </div>
      </div>
      {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/50"><Loader2 className="animate-spin text-brand-primary" /></div>}
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="text-slate-400 text-sm border-b border-white/5">
            <tr>
              <th className="pb-4 text-left">日期</th>
              <th className="pb-4 text-left">内容</th>
              <th className="pb-4 text-right">金额</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredData.map((item: any) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="py-4 text-slate-400 text-sm">{item.date}</td>
                <td className="py-4 flex items-center gap-2">
                  {item.type === '收入' ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-rose-400" />}
                  {item.title}
                </td>
                <td className="py-4 text-right font-bold">¥ {item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
