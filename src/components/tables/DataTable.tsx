import React, { useState, useMemo } from 'react';
import { Search, Loader2, ArrowUpRight, ArrowDownRight, Edit2, Trash2, X } from 'lucide-react';
import { formatQty } from '../../utils/index';

export const DataTable = ({ data, title, filterType, isLoading, onEdit, onDelete }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    let result = filterType ? data.filter((d: any) => d.type === filterType) : data;
    
    if (searchTerm) {
      result = result.filter((item: any) => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== '全部') {
      result = result.filter((item: any) => {
        if (selectedCategory === '燃油') return item.type === '燃油采购';
        if (selectedCategory === '日常收入') return item.type === '收入';
        if (selectedCategory === '日常支出') return item.type === '支出';
        const matchCategory = item.category === selectedCategory;
        const matchKeyword = (item.title && item.title.includes(selectedCategory));
        return matchCategory || matchKeyword;
      });
    }

    if (startDate) result = result.filter((item: any) => item.date >= startDate);
    if (endDate) result = result.filter((item: any) => item.date <= endDate);

    return result;
  }, [data, filterType, searchTerm, selectedCategory, startDate, endDate]);

  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum: number, item: any) => {
      const amount = Number(item.amount);
      if (item.type === '收入') return sum + amount;
      return sum - amount;
    }, 0);
  }, [filteredData]);

  const totalQty = useMemo(() => {
    return filteredData.reduce((sum: number, item: any) => {
      const qStr = (item.quantity || '0').toString().replace(/[^\d.]/g, '');
      const qNum = parseFloat(qStr);
      return sum + (isNaN(qNum) ? 0 : qNum);
    }, 0);
  }, [filteredData]);

  const categories = useMemo(() => {
    if (filterType === '设备采购') return ['全部', '油箱', '炉灶', '煲仔炉', '汤炉', '蒸柜', '运费', '其他配件'];
    if (filterType === '燃油采购') return null;
    return ['全部', '燃油', '油箱', '炉灶', '煲仔炉', '汤炉', '蒸柜', '运费', '其他配件', '日常收入', '日常支出'];
  }, [filterType]);

  const parseBreakdown = (notes: string) => {
    if (!notes || !notes.includes('BREAKDOWN:')) return null;
    try {
      return JSON.parse(notes.split('BREAKDOWN:')[1]);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="glass-card p-8 mb-6 overflow-hidden relative min-h-[300px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg md:text-xl font-black text-white tracking-tighter whitespace-nowrap">{title}</h2>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex items-center gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/5 md:w-auto">
            <div className="flex gap-0.5 border-r border-white/10 pr-1 shrink-0">
              {[
                { label: '今日', getRange: () => { const d = new Date().toISOString().split('T')[0]; return [d, d]; } },
                { label: '本月', getRange: () => { 
                  const now = new Date(); 
                  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                  return [start, end];
                }},
                { label: '本年', getRange: () => { 
                  const year = new Date().getFullYear();
                  return [`${year}-01-01`, `${year}-12-31`];
                }}
              ].map(range => (
                <button
                  key={range.label}
                  onClick={() => {
                    const [s, e] = range.getRange();
                    setStartDate(s);
                    setEndDate(e);
                  }}
                  className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-1 min-w-0">
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-transparent border-none px-1 py-1 text-[10px] outline-none text-slate-300 w-[100px] md:w-[110px] [color-scheme:dark]" 
              />
              <span className="text-slate-700 text-[10px] shrink-0">→</span>
              <input 
                type="date" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-transparent border-none px-1 py-1 text-[10px] outline-none text-slate-300 w-[100px] md:w-[110px] [color-scheme:dark]" 
              />
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="p-1 text-rose-400/50 hover:text-rose-400 transition-colors shrink-0"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="relative w-full md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜索..." 
              className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none focus:border-brand-primary/50 transition-all text-white placeholder:text-slate-600" 
            />
          </div>
        </div>
      </div>

      {categories && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                selectedCategory === cat 
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' 
                : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className={`grid ${totalQty > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-8 animate-in fade-in slide-in-from-top-2 duration-300`}>
         <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
              {selectedCategory === '全部' ? '筛选范围内总额' : `${selectedCategory}总额`}
            </p>
            <p className={`text-2xl font-black ${totalAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ¥ {totalAmount.toLocaleString()}
            </p>
         </div>
         {(selectedCategory !== '全部' || filterType) && totalQty > 0 && (
           <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
              <p className="text-[10px] text-brand-primary uppercase font-bold tracking-wider mb-1">
                {selectedCategory === '全部' ? '累计进货总量' : `${selectedCategory}总量`}
              </p>
              <p className="text-2xl font-black text-brand-primary">
                {totalQty.toLocaleString()} <span className="text-xs font-normal">
                  {(selectedCategory === '燃油' || filterType === '燃油采购') ? 'kg' : '个'}
                </span>
              </p>
           </div>
         )}
      </div>

      {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/50 z-10"><Loader2 className="animate-spin text-brand-primary" /></div>}
      
      <div className="hidden md:block overflow-x-auto">
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
            {filteredData.map((item: any) => {
              const breakdown = parseBreakdown(item.notes || '');
              const isExpanded = expandedId === item.id;
              
              return (
                <React.Fragment key={item.id}>
                  <tr 
                    className={`hover:bg-white/5 transition-colors group cursor-pointer ${isExpanded ? 'bg-white/10' : ''}`}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <td className="py-4 text-slate-400 text-sm">{item.date}</td>
                    <td className="py-4 flex items-center gap-2">
                      {item.type === '收入' || item.type === '销售录入' ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-rose-400" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.type === '设备采购' && item.title.includes('/') ? (
                              <div className="flex flex-col">
                                <span className="text-white">{item.title.split(' ')[0]}</span>
                                <span className="text-slate-400 text-[10px]">{item.title.split(' ').slice(1).join(' ')}</span>
                              </div>
                            ) : item.title}
                          </span>
                          {item.source === 'sale' && (
                            <span className="px-1.5 py-0.5 bg-blue-400/10 text-blue-400 text-[9px] rounded-full border border-blue-400/20 font-bold uppercase tracking-wider">
                              销售单
                            </span>
                          )}
                        </div>
                        {item.category && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] rounded border border-brand-primary/20">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right text-slate-400 text-sm font-mono whitespace-nowrap">
                       <div className="flex flex-col items-end">
                         <span>{formatQty(item.quantity)}</span>
                         {breakdown && breakdown.barrelCount && (
                           <span className="text-[10px] text-slate-500 font-bold">
                             {breakdown.barrelCount} 桶
                           </span>
                         )}
                       </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-xs max-w-[200px] truncate" title={item.notes?.split('BREAKDOWN:')[0]}>
                      {item.notes?.split('BREAKDOWN:')[0] || '-'}
                    </td>
                    <td className="py-4 text-right font-bold whitespace-nowrap">
                       <span className={item.type === '销售录入' ? 'text-blue-400' : ''}>
                         ¥ {Number(item.amount).toLocaleString()}
                       </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1 hover:text-brand-primary transition-colors"><Edit2 size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id, item); }} className="p-1 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && breakdown && (
                    <tr>
                      <td colSpan={6} className="bg-black/40 p-0 border-l-2 border-brand-primary">
                        <div className="p-6 grid grid-cols-3 gap-8 animate-in slide-in-from-top-2 duration-300">
                          <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">基础物料成本</p>
                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-300">{item.title} (¥{breakdown.oilBasePrice}/吨)</span>
                                <span className="text-[10px] text-slate-500">
                                  {breakdown.barrelCount}桶 × 1000L × 密度{breakdown.density || '0.85'}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-white">¥{((parseFloat(item.quantity) / 1000) * parseFloat(breakdown.oilBasePrice)).toFixed(2).replace(/\.?0+$/, '')}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                              <span className="text-xs text-slate-300">吨桶费 (¥{breakdown.barrelCost} × {breakdown.barrelCount}个)</span>
                              <span className="text-sm font-bold text-white">¥{(parseFloat(breakdown.barrelCost) * parseFloat(breakdown.barrelCount)).toFixed(2).replace(/\.?0+$/, '')}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">附加服务费用</p>
                            {breakdown.useHandlingFee !== false && (breakdown.useHandlingFee || (breakdown.handlingFeeMode === 'fixed' ? parseFloat(breakdown.handlingFeeFixed) > 0 : parseFloat(breakdown.handlingRate) > 0)) && (
                              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                <span className="text-xs text-slate-300">
                                  手续费 {breakdown.handlingFeeMode === 'fixed' ? '(固定金额)' : `(${breakdown.handlingRate}%)`}
                                </span>
                                <span className="text-sm font-bold text-white">
                                  ¥{breakdown.handlingFeeMode === 'fixed' 
                                    ? parseFloat(breakdown.handlingFeeFixed || 0).toFixed(2).replace(/\.?0+$/, '')
                                    : ((parseFloat(item.quantity) / 1000) * parseFloat(breakdown.oilBasePrice) * (parseFloat(breakdown.handlingRate || 0) / 100)).toFixed(2).replace(/\.?0+$/, '')}
                                </span>
                              </div>
                            )}
                            {breakdown.useTaxFee !== false && (breakdown.useTaxFee || (breakdown.taxFeeMode === 'fixed' ? parseFloat(breakdown.taxFeeFixed) > 0 : parseFloat(breakdown.taxRate) > 0)) && (
                              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                <span className="text-xs text-slate-300">
                                  开票费 {breakdown.taxFeeMode === 'fixed' ? '(固定金额)' : `(${breakdown.taxRate}%)`}
                                </span>
                                <span className="text-sm font-bold text-white">
                                  ¥{breakdown.taxFeeMode === 'fixed' 
                                    ? parseFloat(breakdown.taxFeeFixed || 0).toFixed(2).replace(/\.?0+$/, '')
                                    : ((parseFloat(item.quantity) / 1000) * parseFloat(breakdown.oilBasePrice) * (parseFloat(breakdown.taxRate || 0) / 100)).toFixed(2).replace(/\.?0+$/, '')}
                                </span>
                              </div>
                            )}
                            {(breakdown.useHandlingFee === false || (breakdown.useHandlingFee === undefined && parseFloat(breakdown.handlingRate) <= 0)) && 
                             (breakdown.useTaxFee === false || (breakdown.useTaxFee === undefined && parseFloat(breakdown.taxRate) <= 0)) && (
                              <div className="text-xs text-slate-600 italic py-2">无额外服务费</div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">物流转运成本</p>
                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                              <span className="text-xs text-slate-300">物流运费 (按吨计)</span>
                              <span className="text-sm font-bold text-white">¥{breakdown.shippingFee}</span>
                            </div>
                            <div className="pt-2 flex justify-between items-center">
                              <span className="text-[10px] text-brand-primary font-black uppercase">总支出核算</span>
                              <span className="text-lg font-black text-brand-primary">¥{Number(item.amount).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="py-20 text-center text-slate-600 italic">暂无进货记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {filteredData.map((item: any) => (
          <div key={item.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {item.type === '收入' || item.type === '销售录入' ? <ArrowUpRight size={16} className="text-emerald-400" /> : <ArrowDownRight size={16} className="text-rose-400" />}
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {item.title}
                    {item.source === 'sale' && (
                      <span className="px-1 py-0.5 bg-blue-400/10 text-blue-400 text-[8px] rounded border border-blue-400/20 uppercase">销售单</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-base font-black ${item.type === '销售录入' ? 'text-blue-400' : 'text-white'}`}>
                  ¥ {Number(item.amount).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">{formatQty(item.quantity)}</div>
              </div>
            </div>
            
            {item.category && (
              <span className="inline-block px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] rounded border border-brand-primary/20">
                {item.category}
              </span>
            )}
            
            {item.notes && (
              <div className="text-xs text-slate-500 bg-black/20 p-2 rounded-lg border border-white/5">
                {item.notes.split('BREAKDOWN:')[0]}
              </div>
            )}
            
            <div className="flex justify-end gap-4 pt-2 border-t border-white/5">
              <button onClick={() => onEdit(item)} className="text-xs text-slate-400 flex items-center gap-1 hover:text-brand-primary">
                <Edit2 size={14} /> 编辑
              </button>
              <button onClick={() => onDelete(item.id, item)} className="text-xs text-slate-400 flex items-center gap-1 hover:text-rose-400">
                <Trash2 size={14} /> 删除
              </button>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="py-12 text-center text-slate-600 italic text-sm">暂无进货记录</div>
        )}
      </div>
    </div>
  );
};
