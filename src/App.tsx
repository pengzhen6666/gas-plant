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
  RotateCcw,
  Edit2,
  Trash2,
  Phone as PhoneIcon,
  Wallet,
  ArrowRight,
  BarChart3,
  ShoppingCart,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Package,
  BadgeDollarSign,
  Clock,
  Calculator,
  ArrowUp,
  ArrowDown,
  User,
  HandCoins,
  History as HistoryIcon,
  StickyNote,
  PieChart,
  Activity,
  Tags
} from 'lucide-react';
import { supabase } from './lib/supabase';

// --- Types ---
type RecordType = '收入' | '支出' | '燃油采购' | '设备采购' | '销售录入';
type SettlementType = '现结' | '月结' | '押一付一' | '其他';

interface Transaction {
  id: string;
  date: string;
  type: RecordType;
  title: string;
  amount: number;
  quantity?: string;
  notes?: string;
}

interface Sale {
  id: string;
  customer_name: string;
  phone: string; 
  delivery_date: string;
  quantity: number;
  total_price: number;
  paid_amount: number;
  status: '已付款' | '未付款' | '部分付款';
  payment_date?: string;
  notes?: string;
  settlement_type?: SettlementType;
}

interface MerchantSummary {
  customer_name: string;
  phone: string;
  total_quantity: number;
  total_amount: number;
  total_paid: number;
  total_debt: number;
  records_count: number;
  settled_count: number;
  settlement_type?: SettlementType;
}

// --- Utils ---
const kgToJin = (kg: number | string) => {
  const val = Number(kg);
  return isNaN(val) ? 0 : Number((val * 2).toFixed(2));
};

const jinToKg = (jin: number | string) => {
  const val = Number(jin);
  return isNaN(val) ? 0 : Number((val / 2).toFixed(2));
};

const formatQty = (qty: string | undefined) => {
  if (!qty) return '-';
  // Clean up legacy "个/台" strings from DB
  return qty.replace('个/台', '个');
};

// --- Components ---

const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend, isHighlight }: any) => (
  <div className={`glass-card p-6 border-l-4 ${isHighlight ? 'bg-brand-primary/5 border-l-brand-primary shadow-xl shadow-brand-primary/5' : `border-l-${colorClass}`}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${isHighlight ? 'bg-brand-primary/20' : `bg-${colorClass}/10`}`}>
        <Icon size={24} className={isHighlight ? 'text-brand-primary' : `text-${colorClass}`} />
      </div>
      {trend !== undefined && (
        <span className={`font-semibold text-sm ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className={`text-2xl font-bold mt-1 ${isHighlight ? 'text-white' : ''}`}>{value}</p>
    {subValue && <p className="text-slate-500 text-xs mt-1">{subValue}</p>}
  </div>
);

const RecordModal = ({ isOpen, onClose, onAddTransaction, onAddSale, onUpdateTransaction, onUpdateSale, isSubmitting, editData, prefillData }: any) => {
  const [inputUnit, setInputUnit] = useState<'kg' | '斤'>('kg');
  const [formData, setFormData] = useState({
    type: '收入' as RecordType,
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit_price: '',
    notes: '',
    customer_name: '',
    phone: '',
    total_price: '',
    paid_amount: '',
    payment_date: '',
    settlement_type: '现结' as SettlementType,
  });

  useEffect(() => {
    if (editData) {
      if ('customer_name' in editData) {
        setFormData({
          type: '销售录入',
          title: '',
          amount: '',
          date: editData.delivery_date,
          quantity: editData.quantity.toString(),
          unit_price: '', 
          notes: editData.notes || '',
          customer_name: editData.customer_name,
          phone: editData.phone || '',
          total_price: editData.total_price.toString(),
          paid_amount: editData.paid_amount.toString(),
          payment_date: editData.payment_date || '',
          settlement_type: editData.settlement_type || '现结',
        });
        if (editData.quantity > 0) {
           const up = (editData.total_price / editData.quantity).toFixed(2).replace(/\.?0+$/, '');
           setFormData(prev => ({...prev, unit_price: up}));
        }
        setInputUnit('kg'); 
      } else {
        setFormData({
          type: editData.type,
          title: editData.title,
          amount: editData.amount.toString(),
          date: editData.date,
          quantity: editData.quantity?.replace(/[^\d.]/g, '') || '', 
          unit_price: '',
          notes: editData.notes || '',
          customer_name: '',
          phone: '',
          total_price: '',
          paid_amount: '',
          payment_date: '',
          settlement_type: '现结',
        });
        const qtyNum = parseFloat(editData.quantity || '0');
        if (qtyNum > 0) {
           const up = (editData.amount / qtyNum).toFixed(2).replace(/\.?0+$/, '');
           setFormData(prev => ({...prev, unit_price: up}));
        }
      }
    } else if (prefillData) {
      setFormData({
        type: '销售录入',
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        unit_price: '',
        notes: '',
        customer_name: prefillData.customer_name || '',
        phone: prefillData.phone || '',
        total_price: '',
        paid_amount: '',
        payment_date: '',
        settlement_type: prefillData.settlement_type || '现结',
      });
    } else {
      setFormData({
        type: '收入',
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        unit_price: '',
        notes: '',
        customer_name: '',
        phone: '',
        total_price: '',
        paid_amount: '',
        payment_date: '',
        settlement_type: '现结',
      });
    }
  }, [editData, prefillData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const up = parseFloat(formData.unit_price);
    const qty = parseFloat(formData.quantity);
    if (!isNaN(up) && !isNaN(qty) && up > 0 && qty > 0) {
      const total = (up * qty).toFixed(2).replace(/\.?0+$/, '');
      if (formData.type === '销售录入') {
        if (formData.total_price !== total) {
          setFormData(prev => ({...prev, total_price: total}));
        }
      } else if (formData.type === '燃油采购' || formData.type === '设备采购') {
        if (formData.amount !== total) {
          setFormData(prev => ({...prev, amount: total}));
        }
      }
    }
  }, [formData.unit_price, formData.quantity, formData.type, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === '销售录入' && formData.phone) {
      const phoneClean = formData.phone.replace(/\s/g, '');
      if (!/^\d{11}$/.test(phoneClean)) {
        alert('请输入正确的11位手机号码');
        return;
      }
    }

    if (formData.type === '销售录入') {
      const totalPrice = Number(formData.total_price);
      const paidAmount = Number(formData.paid_amount);
      let status: any = '未付款';
      if (paidAmount >= totalPrice - 0.01) status = '已付款';
      else if (paidAmount > 0) status = '部分付款';

      const finalQuantity = inputUnit === '斤' ? jinToKg(formData.quantity) : Number(formData.quantity);

      const saleData = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        delivery_date: formData.date,
        quantity: finalQuantity,
        total_price: totalPrice,
        paid_amount: paidAmount,
        status: status,
        payment_date: formData.payment_date || null,
        notes: formData.notes,
        settlement_type: formData.settlement_type
      };

      if (editData && 'customer_name' in editData) {
        onUpdateSale(editData.id, saleData);
      } else {
        onAddSale(saleData);
      }
    } else {
      const txData = {
        type: formData.type,
        title: formData.title,
        amount: Number(formData.amount),
        date: formData.date,
        quantity: formData.type === '燃油采购' ? `${formData.quantity}kg` : (formData.type === '设备采购' ? `${formData.quantity}个` : formData.quantity),
        notes: formData.notes
      };

      if (editData && !('customer_name' in editData)) {
        onUpdateTransaction(editData.id, txData);
      } else {
        onAddTransaction(txData);
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, ''); 
    if (val.length <= 11) {
      setFormData({...formData, phone: val});
    }
  };

  const toggleUnit = () => {
    if (!formData.quantity) {
      setInputUnit(inputUnit === 'kg' ? '斤' : 'kg');
      return;
    }
    if (inputUnit === 'kg') {
      setFormData({...formData, quantity: (Number(formData.quantity) * 2).toFixed(2).replace(/\.?0+$/, '')});
      setInputUnit('斤');
    } else {
      setFormData({...formData, quantity: (Number(formData.quantity) / 2).toFixed(2).replace(/\.?0+$/, '')});
      setInputUnit('kg');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="glass-card w-full max-w-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{editData ? '编辑记录' : (prefillData ? '老客户续订' : '新增记录')}</h2>
          <X size={24} onClick={onClose} className="cursor-pointer text-slate-400 hover:text-white transition-colors" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">记录类型</label>
            <select 
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as RecordType})}
              disabled={isSubmitting || !!editData || !!prefillData}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">商家名称</label>
                  <input 
                    type="text" 
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                    placeholder="商家全称..."
                    value={formData.customer_name}
                    onChange={e => setFormData({...formData, customer_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">结算方式</label>
                  <select 
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                    value={formData.settlement_type}
                    onChange={e => setFormData({...formData, settlement_type: e.target.value as SettlementType})}
                  >
                    <option value="现结">现结</option>
                    <option value="月结">月结</option>
                    <option value="押一付一">押一付一</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">联系电话 (11位)</label>
                  <input 
                    type="text" 
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength={11}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">订货日期</label>
                  <input 
                    type="date" 
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-brand-primary font-bold">数量 ({inputUnit})</label>
                    <button type="button" onClick={toggleUnit} className="text-[10px] bg-brand-primary/20 px-2 py-0.5 rounded-full hover:bg-brand-primary transition-all">
                      换为{inputUnit === 'kg' ? '斤' : 'kg'}
                    </button>
                  </div>
                  <input 
                    type="number" step="any"
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-brand-primary font-bold">单价 (¥/{inputUnit})</label>
                  <input 
                    type="number" step="any"
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
                    placeholder="输入单价..."
                    value={formData.unit_price}
                    onChange={e => setFormData({...formData, unit_price: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">本次总计应收 (¥)</label>
                  <input 
                    type="number" step="any"
                    className="w-full bg-emerald-400/5 border border-emerald-400/20 rounded-xl p-3 outline-none focus:border-emerald-400 font-bold text-emerald-400"
                    placeholder="自动计算..."
                    value={formData.total_price}
                    onChange={e => setFormData({...formData, total_price: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">本次实收 (¥)</label>
                  <input 
                    type="number" step="any"
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
                    placeholder="不填为0"
                    value={formData.paid_amount}
                    onChange={e => setFormData({...formData, paid_amount: e.target.value})}
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
                  className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                  placeholder="输入交易说明..."
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              {(formData.type === '燃油采购' || formData.type === '设备采购') ? (
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-2">
                    <label className="text-sm text-brand-primary font-bold">数量 ({formData.type === '燃油采购' ? 'kg' : '个'})</label>
                    <input 
                      type="number" step="any"
                      className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-brand-primary font-bold">采购单价 (¥)</label>
                    <input 
                      type="number" step="any"
                      className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
                      placeholder="输入单价..."
                      value={formData.unit_price}
                      onChange={e => setFormData({...formData, unit_price: e.target.value})}
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">总计金额 (¥)</label>
                  <input 
                    type="number" step="any"
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white font-bold"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">日期</label>
                  <input 
                    type="date" 
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm text-slate-400">备注 (可选)</label>
            <textarea 
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white min-h-[80px]"
              placeholder="添加额外信息..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              disabled={isSubmitting}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full justify-center py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (editData ? '保存修改' : '确认录入')}
          </button>
        </form>
      </div>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, sale, onProcessPayment, isSubmitting }: any) => {
  const [payAmount, setPayAmount] = useState('');
  const debt = sale ? Number(sale.total_price) - Number(sale.paid_amount) : 0;

  if (!isOpen || !sale) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payAmount);
    if (amount <= 0) return alert('请输入有效还款金额');
    if (amount > debt + 0.01) return alert('还款金额不能超过剩余欠款');
    onProcessPayment(sale, amount);
    setPayAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1100] p-4">
      <div className="glass-card w-full max-md:max-w-full max-w-md p-8 animate-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-white mb-2">还款录入</h2>
        <p className="text-slate-400 text-sm mb-6">商家: {sale.customer_name} | 待付金额: <span className="text-rose-400 font-bold">¥{debt.toLocaleString()}</span></p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">本次还款金额 (¥)</label>
            <input 
              type="number" step="any" autoFocus
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-4 text-2xl font-bold text-brand-primary outline-none focus:border-brand-primary"
              placeholder="输入收款金额..."
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">取消</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-3 justify-center">
              {isSubmitting ? <Loader2 className="animate-spin" /> : '确认收款'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DataTable = ({ data, title, filterType, isLoading, onEdit, onDelete }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = useMemo(() => {
    let result = filterType ? data.filter((d: any) => d.type === filterType) : data;
    if (searchTerm) {
      result = result.filter((item: any) => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return result;
  }, [data, filterType, searchTerm]);

  const totalAmount = useMemo(() => filteredData.reduce((sum: number, item: any) => sum + Number(item.amount), 0), [filteredData]);
  const totalQty = useMemo(() => {
    return filteredData.reduce((sum: number, item: any) => {
      const qStr = (item.quantity || '0').toString().replace(/[^\d.]/g, '');
      const qNum = parseFloat(qStr);
      return sum + (isNaN(qNum) ? 0 : qNum);
    }, 0);
  }, [filteredData]);

  return (
    <div className="glass-card p-8 mb-6 overflow-hidden relative min-h-[300px]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜索记录..." 
            className="bg-bg-secondary border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-primary transition-colors text-white" 
          />
        </div>
      </div>

      {(filterType === '燃油采购' || filterType === '设备采购') && (
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">累计进货总额</p>
              <p className="text-2xl font-black text-white">¥ {totalAmount.toLocaleString()}</p>
           </div>
           <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
              <p className="text-[10px] text-brand-primary uppercase font-bold tracking-wider mb-1">累计进货总量</p>
              <p className="text-2xl font-black text-brand-primary">
                {totalQty.toLocaleString()} <span className="text-xs font-normal">{filterType === '燃油采购' ? 'kg' : '个'}</span>
              </p>
           </div>
        </div>
      )}

      {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/50 z-10"><Loader2 className="animate-spin text-brand-primary" /></div>}
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead className="text-slate-400 text-sm border-b border-white/5">
            <tr>
              <th className="pb-4 text-left">日期</th>
              <th className="pb-4 text-left">内容</th>
              <th className="pb-4 text-right">数量</th>
              <th className="pb-4 text-left px-4">备注说明</th>
              <th className="pb-4 text-right">金额</th>
              <th className="pb-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredData.map((item: any) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                <td className="py-4 text-slate-400 text-sm">{item.date}</td>
                <td className="py-4 flex items-center gap-2">
                  {item.type === '收入' ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-rose-400" />}
                  {item.title}
                </td>
                <td className="py-4 text-right text-slate-400 text-sm font-mono whitespace-nowrap">
                   {formatQty(item.quantity)}
                </td>
                <td className="py-4 px-4 text-slate-500 text-xs max-w-[200px] truncate" title={item.notes}>{item.notes || '-'}</td>
                <td className="py-4 text-right font-bold whitespace-nowrap">¥ {Number(item.amount).toLocaleString()}</td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(item)} className="p-1 hover:text-brand-primary transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => onDelete(item.id)} className="p-1 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-20 text-center text-slate-600 italic">暂无进货记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MerchantExpandableRow = ({ stat, sales, transactions, onNewOrder, onEdit, onDelete, onQuickPay }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = stat.total_amount > 0 ? (stat.total_paid / stat.total_amount) * 100 : 0;

  // BULL-PROOF LEDGER GENERATOR
  const combinedList = useMemo(() => {
    const list: any[] = [];
    
    // 1. Find all orders for this merchant
    const merchantOrders = sales.filter((s: Sale) => s.customer_name === stat.customer_name);
    // 2. Find ALL payment transactions for this merchant
    const merchantPayments = transactions.filter((t: Transaction) => 
      t.type === '收入' && 
      t.title.includes(stat.customer_name)
    );

    // 3. Process orders
    merchantOrders.forEach(s => {
      list.push({ 
        date: s.delivery_date, 
        type: '订油 (销售)', 
        amountDue: s.total_price, 
        amountPaid: 0, // This will be filled if there's a payment on the SAME DAY
        sortKey: `${s.delivery_date}_0`,
        id: s.id,
        notes: s.notes
      });
    });

    // 4. Process all payments independently
    merchantPayments.forEach(t => {
      list.push({ 
        date: t.date, 
        type: '收款 (还账)', 
        amountDue: 0, 
        amountPaid: t.amount, 
        sortKey: `${t.date}_1`,
        id: t.id,
        notes: t.notes
      });
    });
    
    // 5. SORT oldest to newest for linear balance calculation
    list.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    // 6. SMART MERGE: If order and payment are on the SAME DAY, merge them into one "现结" row
    const mergedList: any[] = [];
    const processedPaymentIds = new Set();

    list.forEach((item, idx) => {
      if (item.type === '订油 (销售)') {
        // Look for a payment on the same date that hasn't been used yet
        const sameDayPayment = list.find(p => 
          p.type === '收款 (还账)' && 
          p.date === item.date && 
          !processedPaymentIds.has(p.id)
        );

        if (sameDayPayment) {
          mergedList.push({
            ...item,
            type: '订油 (现结)',
            amountPaid: sameDayPayment.amountPaid,
            notes: (item.notes ? item.notes + ' | ' : '') + (sameDayPayment.notes || '当日结清')
          });
          processedPaymentIds.add(sameDayPayment.id);
        } else {
          mergedList.push({
            ...item,
            type: '订油 (赊账)'
          });
        }
      } else if (item.type === '收款 (还账)') {
        if (!processedPaymentIds.has(item.id)) {
          mergedList.push(item);
        }
      }
    });

    // 7. Calculate running balance on the merged list
    let bal = 0;
    const final = mergedList.map(item => {
      bal = bal + (item.amountDue || 0) - (item.amountPaid || 0);
      return { ...item, balance: bal };
    });
    
    return final.reverse(); // Newest first for display
  }, [sales, transactions, stat.customer_name]);

  return (
    <>
      <tr 
        className={`hover:bg-white/5 transition-colors cursor-pointer group ${isExpanded ? 'bg-white/5' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="py-5 px-4">
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronUp size={16} className="text-brand-primary" /> : <ChevronDown size={16} className="text-slate-500" />}
            <div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-white text-lg">{stat.customer_name}</div>
                {stat.settlement_type && (
                  <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] rounded border border-brand-primary/20">{stat.settlement_type}</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <PhoneIcon size={10} /> {stat.phone || '未记录电话'}
              </div>
            </div>
          </div>
        </td>
        <td className="py-5 px-2 text-right">
          <div className="text-white font-bold">{stat.total_quantity.toLocaleString()} kg</div>
          <div className="text-[10px] text-brand-primary">折合: {kgToJin(stat.total_quantity).toLocaleString()} 斤</div>
          <div className="text-[10px] text-slate-500 mt-0.5">订单数: {stat.records_count}</div>
        </td>
        <td className="py-5 px-2 text-right text-emerald-400">¥ {stat.total_paid.toLocaleString()}</td>
        <td className="py-5 px-2 text-right">
          <span className={`font-black text-xl ${stat.total_debt > 0.01 ? 'text-rose-400' : 'text-emerald-400'}`}>
            ¥ {Math.max(0, stat.total_debt).toLocaleString()}
          </span>
        </td>
        <td className="py-5 px-2 text-center min-w-[120px]">
          <div className="flex flex-col items-center gap-1 px-4">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary" style={{width: `${progress}%`}} />
            </div>
            <span className="text-[10px] text-slate-500 font-bold">{progress.toFixed(1)}%</span>
          </div>
        </td>
        <td className="py-5 px-4 text-right" onClick={e => e.stopPropagation()}>
           <button 
            onClick={() => onNewOrder(stat.customer_name, stat.phone, stat.settlement_type)}
            className="btn-primary py-2 px-3 text-xs flex items-center gap-2 justify-end ml-auto"
           >
             <ShoppingCart size={14} /> 再订一单
           </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0 border-b border-white/5 bg-black/40">
            <div className="p-6 animate-in slide-in-from-top-2 duration-300">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <HistoryIcon className="text-brand-primary" size={18} /> 真实对账流水 (含备注说明)
                  </h3>
                  <div className="flex gap-4 text-xs">
                     <div className="text-slate-400">商户: <span className="text-white font-bold">{stat.customer_name}</span></div>
                     <div className="text-slate-400">总欠款: <span className="text-rose-400 font-bold">¥{Math.max(0, stat.total_debt).toLocaleString()}</span></div>
                  </div>
               </div>
               <div className="overflow-hidden rounded-2xl border border-white/10 bg-bg-secondary shadow-2xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                        <th className="py-4 px-6 text-left font-bold uppercase tracking-wider">日期</th>
                        <th className="py-4 px-6 text-left font-bold uppercase tracking-wider">事项内容</th>
                        <th className="py-4 px-6 text-left font-bold uppercase tracking-wider">备注说明</th>
                        <th className="py-4 px-6 text-right font-bold uppercase tracking-wider text-rose-400">应收 (油钱)</th>
                        <th className="py-4 px-6 text-right font-bold uppercase tracking-wider text-emerald-400">实收 (已付)</th>
                        <th className="py-4 px-6 text-right font-bold uppercase tracking-wider bg-white/5">剩余总欠款</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {combinedList.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors group">
                          <td className="py-4 px-6 text-slate-400 font-mono">{row.date}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 font-bold px-2 py-1 rounded-lg text-[10px] ${row.type.includes('现结') ? 'bg-emerald-400/10 text-emerald-400' : row.type.includes('赊账') ? 'bg-rose-400/10 text-rose-400' : 'bg-brand-primary/10 text-brand-primary'}`}>
                              {row.type.includes('现结') ? <HandCoins size={12} /> : row.type.includes('赊账') ? <AlertCircle size={12} /> : <BadgeDollarSign size={12} />}
                              {row.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 text-[11px] max-w-[200px] truncate" title={row.notes}>
                            {row.notes || '-'}
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-white">
                            {row.amountDue > 0 ? `¥${row.amountDue.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-emerald-400">
                            {row.amountPaid > 0 ? `¥${row.amountPaid.toLocaleString()}` : '-'}
                          </td>
                          <td className={`py-4 px-6 text-right font-black bg-white/5 group-hover:bg-white/10 transition-colors ${row.balance > 0.01 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            ¥ {Math.max(0, row.balance).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {combinedList.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-600 italic">该商户暂无任何订货或往来记录</td></tr>}
                    </tbody>
                  </table>
               </div>
               <div className="mt-4 p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-[11px] text-slate-500 italic flex justify-between items-center">
                 <span>提示：系统会自动匹配日期，只有【同一天】订油且交钱才记为现结，不同日期的订油和还款将分开显示。</span>
                 <span className="text-emerald-400">当前商户状态：{stat.total_debt > 0.01 ? '有欠款待追回' : '账目已清'}</span>
               </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const SalesTable = ({ data, transactions, isLoading, onEdit, onDelete, onQuickPay, onNewOrder }: { data: Sale[], transactions: Transaction[], isLoading: boolean, onEdit: (s: Sale) => void, onDelete: (id: string) => void, onQuickPay: (s: Sale) => void, onNewOrder: (name: string, phone: string, settlement_type?: SettlementType) => void }) => {
  const [view, setView] = useState<'list' | 'stats'>('stats'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = !searchTerm || 
        item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.phone && item.phone.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === '全部' || item.status === statusFilter;
      const matchDate = (!startDate || item.delivery_date >= startDate) && 
                        (!endDate || item.delivery_date <= endDate);
      return matchSearch && matchStatus && matchDate;
    });
  }, [data, searchTerm, statusFilter, startDate, endDate]);

  const merchantStats = useMemo(() => {
    const statsMap: Record<string, MerchantSummary> = {};
    filteredData.forEach(sale => {
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
          settlement_type: sale.settlement_type
        };
      }
      statsMap[key].total_quantity += Number(sale.quantity);
      statsMap[key].total_amount += Number(sale.total_price);
      statsMap[key].total_paid += Number(sale.paid_amount);
      statsMap[key].total_debt = statsMap[key].total_amount - statsMap[key].total_paid;
      statsMap[key].records_count += 1;
      if (sale.status === '已付款') statsMap[key].settled_count += 1;
      if (sale.settlement_type) statsMap[key].settlement_type = sale.settlement_type;
    });
    return Object.values(statsMap).sort((a, b) => b.total_debt - a.total_debt);
  }, [filteredData]);

  return (
    <div className="space-y-6">
       <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Filter size={16} className="text-brand-primary" />
              商户中心筛选
            </div>
            <div className="flex bg-white/5 p-1 rounded-lg">
              <button onClick={() => setView('stats')} className={`px-3 py-1 text-xs rounded-md transition-colors ${view === 'stats' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>商户总览 (一户一档)</button>
              <button onClick={() => setView('list')} className={`px-3 py-1 text-xs rounded-md transition-colors ${view === 'list' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>详细订货历史</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索商家" className="w-full bg-bg-secondary border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-primary transition-colors text-white" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-primary transition-colors text-white">
            <option value="全部">还款状态 (全部)</option>
            <option value="已付款">已结清</option>
            <option value="未付款">全额欠款</option>
            <option value="部分付款">部分还款</option>
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-primary transition-colors text-white" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-primary transition-colors text-white" />
        </div>
      </div>

      <div className="glass-card p-4 lg:p-8 overflow-hidden relative min-h-[400px]">
        {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/50 z-10"><Loader2 className="animate-spin text-brand-primary" size={40} /></div>}
        
        <div className="overflow-x-auto">
          {view === 'list' ? (
            <table className="w-full">
              <thead>
                <tr className="text-left border-bottom border-white/5 text-slate-400 text-sm">
                  <th className="pb-4 px-2">订货日期</th>
                  <th className="pb-4 px-2">商家名称</th>
                  <th className="pb-4 px-2">备注说明</th>
                  <th className="pb-4 px-2 text-right">订油量</th>
                  <th className="pb-4 px-2 text-right">订单总额</th>
                  <th className="pb-4 px-2 text-right">已收金额</th>
                  <th className="pb-4 px-2 text-right text-rose-400">剩余欠款</th>
                  <th className="pb-4 px-2 text-center">状态</th>
                  <th className="pb-4 px-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.map((sale) => {
                  const debt = Number(sale.total_price) - Number(sale.paid_amount);
                  return (
                    <tr key={sale.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2 text-slate-400 text-sm">{sale.delivery_date}</td>
                      <td className="py-4 px-2">
                        <div className="font-medium text-white">{sale.customer_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1">{sale.phone || '-'}</div>
                      </td>
                      <td className="py-4 px-2 text-slate-500 text-xs max-w-[150px] truncate" title={sale.notes}>
                        {sale.notes || '-'}
                      </td>
                      <td className="py-4 px-2 text-right">
                         <div className="text-slate-300 font-mono">{sale.quantity} kg</div>
                         <div className="text-[10px] text-brand-primary">{kgToJin(sale.quantity)} 斤</div>
                      </td>
                      <td className="py-4 px-2 text-right font-semibold">¥ {Number(sale.total_price).toLocaleString()}</td>
                      <td className="py-4 px-2 text-right text-emerald-400">¥ {Number(sale.paid_amount).toLocaleString()}</td>
                      <td className="py-4 px-2 text-right font-bold text-rose-400">¥ {Math.max(0, debt).toLocaleString()}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sale.status === '已付款' ? 'bg-emerald-400/10 text-emerald-400' : 
                          sale.status === '部分付款' ? 'bg-amber-400/10 text-amber-400' : 'bg-rose-400/10 text-rose-400'
                        }`}>{sale.status}</span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {debt > 0.01 && (
                            <button onClick={() => onQuickPay(sale)} className="flex items-center gap-1 px-2 py-1 bg-brand-primary/20 text-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary hover:text-white transition-all">
                              <Wallet size={12} /> 去还款
                            </button>
                          )}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(sale)} className="p-1 hover:text-brand-primary"><Edit2 size={14} /></button>
                            <button onClick={() => onDelete(sale.id)} className="p-1 hover:text-rose-400"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left border-bottom border-white/5 text-slate-400 text-sm">
                  <th className="pb-4 px-4">商户基本信息</th>
                  <th className="pb-4 px-2 text-right">累计订货总量</th>
                  <th className="pb-4 px-2 text-right">已收总计</th>
                  <th className="pb-4 px-2 text-right">累计总欠款</th>
                  <th className="pb-4 px-2 text-center">还款进度</th>
                  <th className="pb-4 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {merchantStats.map((stat, idx) => (
                  <MerchantExpandableRow 
                    key={idx} 
                    stat={stat} 
                    sales={data} 
                    transactions={transactions}
                    onNewOrder={onNewOrder}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onQuickPay={onQuickPay}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Specific Components ---

const ExpandableMerchantRow = ({ merchant, transactions, onQuickPay }: { merchant: MerchantSummary, transactions: Transaction[], onQuickPay: (sale: Sale) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find recent transactions for this merchant name
  const merchantActivity = useMemo(() => {
    return transactions
      .filter(t => t.title.includes(merchant.customer_name))
      .slice(0, 3);
  }, [merchant.customer_name, transactions]);

  return (
    <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${merchant.total_debt > 0 ? 'bg-rose-400/10 text-rose-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
            <Users size={18} />
          </div>
          <div>
            <p className="font-bold text-white">{merchant.customer_name}</p>
            <p className="text-[10px] text-slate-500">{merchant.phone || '无电话'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`font-bold ${merchant.total_debt > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {merchant.total_debt > 0 ? `欠 ¥${merchant.total_debt.toLocaleString()}` : '已结清'}
            </p>
            <p className="text-[10px] text-slate-500">累计用油: {merchant.total_quantity}kg</p>
          </div>
          {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">最近往来明细</p>
            {merchantActivity.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-400">{t.date} · {t.title.split(':')[0]}</span>
                <span className={t.type === '收入' ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                  {t.type === '收入' ? '+' : '-'} ¥{t.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {merchantActivity.length === 0 && <p className="text-xs text-slate-600 italic">暂无近期详细流水</p>}
            
            <div className="pt-3 mt-2 border-t border-white/5 flex justify-between items-center">
               <span className="text-[10px] text-slate-500">共计 {merchant.records_count} 笔订单</span>
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`请前往“商户中心”查看 ${merchant.customer_name} 的完整对账单`);
                }}
                className="text-[10px] text-brand-primary hover:underline flex items-center gap-1"
               >
                 查看完整对账单 <ArrowRight size={10} />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App ---

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [editData, setEditData] = useState<Transaction | Sale | null>(null);
  const [prefillData, setPrefillData] = useState<{customer_name: string, phone: string, settlement_type?: SettlementType} | null>(null);
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
    setPrefillData({ customer_name: name, phone: phone, settlement_type: settlement_type });
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

  const transactionsSorted = useMemo(() => {
    return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions]);

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
          settlement_type: sale.settlement_type
        };
      }
      statsMap[key].total_quantity += Number(sale.quantity);
      statsMap[key].total_amount += Number(sale.total_price);
      statsMap[key].total_paid += Number(sale.paid_amount);
      statsMap[key].total_debt = statsMap[key].total_amount - statsMap[key].total_paid;
      statsMap[key].records_count += 1;
      if (sale.status === '已付款') statsMap[key].settled_count += 1;
      if (sale.settlement_type) statsMap[key].settlement_type = sale.settlement_type;
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
