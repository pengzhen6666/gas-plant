import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { supabase } from './lib/supabase';

// --- Types ---
type RecordType = '收入' | '支出' | '燃油采购' | '设备采购';

interface Transaction {
  id: string;
  date: string;
  type: RecordType;
  title: string;
  amount: number;
  quantity?: string;
  created_at?: string;
}

// --- Components ---

const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend }: any) => (
  <div className="glass-card p-6">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-${colorClass}/10`}>
        <Icon size={24} className={`text-${colorClass}`} />
      </div>
      {trend && (
        <span className={`font-semibold text-sm ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
    {subValue && <p className="text-slate-500 text-xs mt-1">{subValue}</p>}
  </div>
);

const RecordModal = ({ isOpen, onClose, onAdd, isSubmitting }: any) => {
  const [formData, setFormData] = useState({
    type: '收入' as RecordType,
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      amount: Number(formData.amount)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="glass-card w-full max-w-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">新增记录</h2>
          <X size={24} onClick={onClose} className="cursor-pointer text-slate-400 hover:text-white transition-colors" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">记录类型</label>
            <select 
              className="w-full bg-bg-accent border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as RecordType})}
              disabled={isSubmitting}
            >
              <option value="收入">收入</option>
              <option value="支出">支出</option>
              <option value="燃油采购">燃油采购 (植物油/液蜡)</option>
              <option value="设备采购">设备采购 (炉灶)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">摘要内容</label>
            <input 
              type="text" 
              className="w-full bg-bg-accent border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors"
              placeholder="输入交易说明..."
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

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

const DataTable = ({ data, title, filterType, isLoading }: { data: Transaction[], title: string, filterType?: RecordType, isLoading?: boolean }) => {
  const filteredData = filterType ? data.filter(d => d.type === filterType) : data;

  return (
    <div className="glass-card p-8 mb-6 overflow-hidden relative min-h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            placeholder="搜索记录..." 
            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-primary w-full sm:w-64 transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/50 backdrop-blur-sm z-10">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-bottom border-white/5 text-slate-400 text-sm">
              <th className="pb-4 px-2">日期</th>
              <th className="pb-4 px-2">内容</th>
              {(filterType === '燃油采购' || filterType === '设备采购') && <th className="pb-4 px-2">数量</th>}
              <th className="pb-4 px-2 text-right">金额</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-500">暂无数据</td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 px-2 text-slate-400 text-sm whitespace-nowrap">{item.date}</td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      {item.type === '收入' ? 
                        <ArrowUpRight size={14} className="text-emerald-400" /> : 
                        <ArrowDownRight size={14} className="text-rose-400" />
                      }
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </td>
                  {(filterType === '燃油采购' || filterType === '设备采购') && (
                    <td className="py-4 px-2 text-slate-300 text-sm">{item.quantity}</td>
                  )}
                  <td className="py-4 px-2 text-right font-bold whitespace-nowrap">
                    <span className={item.type === '收入' ? 'text-emerald-400' : 'text-slate-100'}>
                      {item.type === '收入' ? '+' : '-'} ¥ {item.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main App ---

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTx])
        .select();

      if (error) throw error;
      if (data) {
        setTransactions([data[0], ...transactions]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('保存失败，请检查 Supabase 配置是否正确');
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'accounting', label: '收支明细', icon: ReceiptIndianRupee },
    { id: 'fuel', label: '燃油管理', icon: Fuel },
    { id: 'stoves', label: '设备采购', icon: FlameKindling },
    { id: 'history', label: '全部历史', icon: History },
  ];

  const totalIncome = transactions.filter(t => t.type === '收入').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type !== '收入').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalFuel = transactions.filter(t => t.type === '燃油采购').reduce((sum, t) => {
    const val = parseFloat(t.quantity || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar */}
      <aside className="w-72 bg-bg-secondary border-r border-white/5 p-8 flex flex-col gap-8 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <FlameKindling color="white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">GUS PLANT</span>
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

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="animate-in fade-in duration-700">
          {activeTab === 'dashboard' && (
            <>
              <header className="mb-10">
                <h1 className="text-3xl font-bold">数据概览</h1>
                <p className="text-slate-400 mt-1">实时掌控您的公司运营财务状况</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <StatCard title="总收入" value={`¥ ${totalIncome.toLocaleString()}`} icon={TrendingUp} colorClass="emerald-400" trend={12} />
                <StatCard title="总支出" value={`¥ ${totalExpense.toLocaleString()}`} icon={TrendingDown} colorClass="rose-400" trend={-5} />
                <StatCard title="植物油总采购" value={`${totalFuel.toLocaleString()} kg`} subValue="含液蜡及各类植物油" icon={Fuel} colorClass="blue-400" />
              </div>

              <DataTable data={transactions.slice(0, 5)} title="最近记录" isLoading={isLoading} />
            </>
          )}

          {activeTab === 'accounting' && (
            <>
              <header className="mb-10">
                <h1 className="text-3xl font-bold">收支明细</h1>
                <p className="text-slate-400 mt-1">查看公司日常经营的所有收支流水</p>
              </header>
              <DataTable data={transactions} title="收支流水" isLoading={isLoading} />
            </>
          )}

          {activeTab === 'fuel' && (
            <>
              <header className="mb-10">
                <h1 className="text-3xl font-bold">燃油管理</h1>
                <p className="text-slate-400 mt-1">植物油（液蜡）的进货与消耗管理</p>
              </header>
              <DataTable data={transactions} title="燃油采购记录" filterType="燃油采购" isLoading={isLoading} />
            </>
          )}

          {activeTab === 'stoves' && (
            <>
              <header className="mb-10">
                <h1 className="text-3xl font-bold">设备采购</h1>
                <p className="text-slate-400 mt-1">植物油炉灶及配件采购清单</p>
              </header>
              <DataTable data={transactions} title="设备采购记录" filterType="设备采购" isLoading={isLoading} />
            </>
          )}

          {activeTab === 'history' && (
            <>
              <header className="mb-10">
                <h1 className="text-3xl font-bold">全部历史</h1>
                <p className="text-slate-400 mt-1">系统所有操作与记录的完整存档</p>
              </header>
              <DataTable data={transactions} title="所有记录" isLoading={isLoading} />
            </>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
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
        onAdd={addTransaction}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default App;
