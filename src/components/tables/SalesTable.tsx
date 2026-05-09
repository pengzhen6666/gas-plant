import { useState, useMemo } from 'react';
import { Filter, Search, Loader2, Wallet, Edit2, Trash2, Package } from 'lucide-react';
import { MerchantExpandableRow } from './MerchantExpandableRow';
import { kgToJin } from '../../utils/index';
import type { Sale, Transaction, MerchantSummary, SettlementType } from '../../types/index';

export const SalesTable = ({ data, transactions, isLoading, onEdit, onDelete, onQuickPay, onNewOrder }: { data: Sale[], transactions: Transaction[], isLoading: boolean, onEdit: (s: Sale) => void, onDelete: (id: string) => void, onQuickPay: (s: Sale) => void, onNewOrder: (name: string, phone: string, settlement_type?: SettlementType) => void }) => {
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
            <>
              {/* Desktop Table View */}
              <table className="hidden md:table w-full">
                <thead>
                  <tr className="text-left border-bottom border-white/5 text-slate-400 text-sm">
                    <th className="pb-4 px-2">订货日期</th>
                    <th className="pb-4 px-2">商家名称</th>
                    <th className="pb-4 px-2">配备设备</th>
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
                        <td className="py-4 px-2">
                          {sale.assigned_equipment ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-brand-primary/10 text-brand-primary text-[10px] rounded border border-brand-primary/20 w-fit">
                              <Package size={10} /> {sale.assigned_equipment}
                            </div>
                          ) : (
                            <span className="text-slate-600 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="py-4 px-2 text-slate-500 text-xs max-w-[150px] truncate" title={sale.notes}>
                          {sale.notes || '-'}
                        </td>
                        <td className="py-4 px-2 text-right whitespace-nowrap">
                           <div className="inline-flex items-baseline gap-1.5">
                             <span className="text-slate-300 font-mono">{sale.quantity} kg</span>
                             <span className="text-[10px] text-brand-primary/80">({kgToJin(sale.quantity)} 斤)</span>
                           </div>
                        </td>
                        <td className="py-4 px-2 text-right font-semibold whitespace-nowrap">¥ {Number(sale.total_price).toLocaleString()}</td>
                        <td className="py-4 px-2 text-right text-emerald-400 whitespace-nowrap">¥ {Number(sale.paid_amount).toLocaleString()}</td>
                        <td className="py-4 px-2 text-right font-bold text-rose-400 whitespace-nowrap">¥ {Math.max(0, debt).toLocaleString()}</td>
                        <td className="py-4 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                            sale.status === '已付款' ? 'bg-emerald-400/10 text-emerald-400' : 
                            sale.status === '部分付款' ? 'bg-amber-400/10 text-amber-400' : 'bg-rose-400/10 text-rose-400'
                          }`}>{sale.status}</span>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                            {debt > 0.01 && (
                              <button onClick={() => onQuickPay(sale)} className="flex items-center gap-1 px-2 py-1 bg-brand-primary/20 text-brand-primary text-[10px] font-bold rounded-lg hover:bg-brand-primary hover:text-white transition-all whitespace-nowrap">
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredData.map((sale) => {
                  const debt = Number(sale.total_price) - Number(sale.paid_amount);
                  return (
                    <div key={sale.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white truncate">{sale.customer_name}</div>
                          <div className="text-[10px] text-slate-500 mt-1">{sale.delivery_date} · {sale.phone || '无电话'}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sale.status === '已付款' ? 'bg-emerald-400/10 text-emerald-400' : 
                          sale.status === '部分付款' ? 'bg-amber-400/10 text-amber-400' : 'bg-rose-400/10 text-rose-400'
                        }`}>{sale.status}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                          <p className="text-slate-500 text-[9px] uppercase font-bold mb-1">订油量</p>
                          <p className="text-white font-mono">{sale.quantity}kg ({kgToJin(sale.quantity)}斤)</p>
                        </div>
                        <div className="bg-black/20 p-2 rounded-lg border border-white/5">
                          <p className="text-slate-500 text-[9px] uppercase font-bold mb-1">剩余欠款</p>
                          <p className="text-rose-400 font-bold">¥{Math.max(0, debt).toLocaleString()}</p>
                        </div>
                      </div>

                      {sale.assigned_equipment && (
                        <div className="flex items-center gap-1 text-[10px] text-brand-primary">
                           <Package size={10} /> 已配: {sale.assigned_equipment}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <div className="flex gap-4">
                          <button onClick={() => onEdit(sale)} className="text-xs text-slate-400 flex items-center gap-1 hover:text-brand-primary">
                            <Edit2 size={12} /> 编辑
                          </button>
                          <button onClick={() => onDelete(sale.id)} className="text-xs text-slate-400 flex items-center gap-1 hover:text-rose-400">
                            <Trash2 size={12} /> 删除
                          </button>
                        </div>
                        {debt > 0.01 && (
                          <button onClick={() => onQuickPay(sale)} className="px-3 py-1 bg-brand-primary text-white text-xs font-bold rounded-lg shadow-lg shadow-brand-primary/20">
                            去还款
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
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
