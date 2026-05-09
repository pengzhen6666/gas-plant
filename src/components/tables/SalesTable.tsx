import { useState, useMemo } from 'react';
import { Filter, Search, Loader2, Wallet, Edit2, Trash2, Package, PlusCircle } from 'lucide-react';
import { MerchantExpandableRow } from './MerchantExpandableRow';
import { kgToJin } from '../../utils/index';
import type { Sale, Transaction, MerchantSummary, SettlementType } from '../../types/index';

export const SalesTable = ({ data, transactions, equipmentCatalog, isLoading, onEdit, onDelete, onQuickPay, onNewOrder }: { data: Sale[], transactions: Transaction[], equipmentCatalog: any[], isLoading: boolean, onEdit: (s: Sale) => void, onDelete: (id: string) => void, onQuickPay: (s: Sale) => void, onNewOrder: (name: string, phone: string, settlement_type?: SettlementType) => void }) => {
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
          assigned_equipment: ''
        };
      }
      statsMap[key].total_quantity += Number(sale.quantity);
      statsMap[key].total_amount += Number(sale.total_price);
      statsMap[key].total_paid += Number(sale.paid_amount);
      statsMap[key].total_debt = statsMap[key].total_amount - statsMap[key].total_paid;
      statsMap[key].records_count += 1;
      if (sale.status === '已付款') statsMap[key].settled_count += 1;
      if (sale.settlement_type) statsMap[key].settlement_type = sale.settlement_type;
      
      // Aggregate unique equipment
      if (sale.assigned_equipment) {
        const current = statsMap[key].assigned_equipment || '';
        const newEquip = sale.assigned_equipment;
        if (!current.includes(newEquip)) {
          statsMap[key].assigned_equipment = current ? `${current}, ${newEquip}` : newEquip;
        }
      }
      
      // Calculate Asset Value
      let assetValue = 0;
      const equipStr = statsMap[key].assigned_equipment || '';
      equipmentCatalog.forEach(item => {
        if (equipStr.includes(item.name)) {
          // Simple quantity extraction: e.g. "2个炉灶" or "50油箱x2"
          const regex = new RegExp(`(\\d+)[个|套|只|x|*]?${item.name}`, 'i');
          const match = equipStr.match(regex) || equipStr.match(new RegExp(`${item.name}[^\\d]*(\\d+)`, 'i'));
          const qty = match ? parseInt(match[1]) : 1;
          assetValue += item.price * qty;
        }
      });
      statsMap[key].total_asset_value = assetValue;
    });
    return Object.values(statsMap).sort((a, b) => b.total_debt - a.total_debt);
  }, [filteredData, equipmentCatalog]);

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

              {/* Mobile Card View (History) */}
              <div className="md:hidden space-y-4">
                {filteredData.map((sale) => {
                  const debt = Number(sale.total_price) - Number(sale.paid_amount);
                  return (
                    <div key={sale.id} className="bg-white/5 rounded-3xl p-5 border border-white/5 space-y-4 shadow-xl">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <div className="text-lg font-black text-white truncate tracking-tight">{sale.customer_name}</div>
                          <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">{sale.delivery_date} · {sale.phone || '暂无联系方式'}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          sale.status === '已付款' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 
                          sale.status === '部分付款' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                        }`}>{sale.status}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                          <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 tracking-widest">本次订油</p>
                          <p className="text-white font-black text-sm">{sale.quantity} <span className="text-[10px] font-normal text-slate-500">kg</span></p>
                          <p className="text-[10px] text-brand-primary font-medium mt-0.5">{kgToJin(sale.quantity)} 斤</p>
                        </div>
                        <div className={`p-3 rounded-2xl border ${debt > 0.01 ? 'bg-rose-400/5 border-rose-400/10' : 'bg-emerald-400/5 border-emerald-400/10'}`}>
                          <p className="text-slate-500 text-[9px] uppercase font-bold mb-1 tracking-widest">当前欠款</p>
                          <p className={`font-black text-sm ${debt > 0.01 ? 'text-rose-400' : 'text-emerald-400'}`}>¥{Math.max(0, debt).toLocaleString()}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">总额: ¥{Number(sale.total_price).toLocaleString()}</p>
                        </div>
                      </div>

                      {sale.assigned_equipment && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-brand-primary/5 rounded-xl border border-brand-primary/10 text-[10px] text-brand-primary font-bold">
                           <Package size={12} /> 配备设备: {sale.assigned_equipment}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <div className="flex gap-4">
                          <button onClick={() => onEdit(sale)} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-brand-primary transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => onDelete(sale.id)} className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-rose-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {debt > 0.01 && (
                          <button 
                            onClick={() => onQuickPay(sale)} 
                            className="px-6 py-2.5 bg-brand-primary text-white text-xs font-black rounded-full shadow-lg shadow-brand-primary/30 active:scale-95 transition-transform"
                          >
                            立即还款
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Desktop View (Overview) */}
              <table className="hidden md:table w-full">
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

              {/* Mobile Card View (Overview) */}
              <div className="md:hidden space-y-4">
                {merchantStats.map((stat, idx) => {
                  const payRate = stat.total_amount > 0 ? (stat.total_paid / stat.total_amount) * 100 : 100;
                  return (
                    <div key={idx} className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-5 shadow-2xl relative overflow-hidden group">
                      {/* Debt Status Badge */}
                      <div className={`absolute top-0 right-0 px-4 py-1.5 text-[10px] font-black rounded-bl-2xl uppercase tracking-widest ${
                        stat.total_debt > 0.01 ? 'bg-rose-400 text-white shadow-lg shadow-rose-400/20' : 'bg-emerald-400 text-white shadow-lg shadow-emerald-400/20'
                      }`}>
                        {stat.total_debt > 0.01 ? '欠款中' : '已结清'}
                      </div>

                      <div>
                        <div className="text-xl font-black text-white tracking-tight">{stat.customer_name}</div>
                        <div className="text-[10px] text-slate-500 mt-1 font-bold flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-white/10 rounded uppercase">{stat.settlement_type || '未设账期'}</span>
                          <span>{stat.phone || '无电话'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                         <div className="text-center p-2 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">总订货</p>
                            <p className="text-xs font-black text-white">{stat.total_quantity}kg</p>
                         </div>
                         <div className="text-center p-2 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">总金额</p>
                            <p className="text-xs font-black text-white">¥{Math.round(stat.total_amount)}</p>
                         </div>
                         <div className={`text-center p-2 rounded-2xl border ${stat.total_debt > 0.01 ? 'bg-rose-400/10 border-rose-400/20' : 'bg-emerald-400/10 border-emerald-400/20'}`}>
                            <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">总欠款</p>
                            <p className={`text-xs font-black ${stat.total_debt > 0.01 ? 'text-rose-400' : 'text-emerald-400'}`}>¥{Math.round(stat.total_debt)}</p>
                         </div>
                      </div>

                      {/* Equipment Asset Value for Mobile */}
                      <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2">
                           <Package size={14} className="text-brand-primary" />
                           <span className="text-[10px] text-slate-400 font-bold">店内存放设备价值</span>
                        </div>
                        <span className="text-xs font-black text-white">¥{stat.total_asset_value?.toLocaleString() || 0}</span>
                      </div>

                      {/* Pay Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                          <span className="text-slate-500">回款进度</span>
                          <span className={payRate >= 100 ? 'text-emerald-400' : 'text-brand-primary'}>{payRate.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-1000 ${payRate >= 100 ? 'bg-emerald-400' : 'bg-brand-primary'}`} style={{ width: `${Math.min(100, payRate)}%` }} />
                        </div>
                      </div>

                      {stat.assigned_equipment && (
                         <div className="text-[10px] text-slate-500 italic bg-black/20 p-2 rounded-xl">
                            配备：{stat.assigned_equipment}
                         </div>
                      )}

                      <button 
                        onClick={() => onNewOrder(stat.customer_name, stat.phone, stat.settlement_type)}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                      >
                        <PlusCircle size={14} className="text-brand-primary" /> 再次订货
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
