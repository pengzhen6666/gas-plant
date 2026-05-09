import { useState, useMemo } from 'react';
import { Search, Loader2, ArrowUpRight, ArrowDownRight, Edit2, Trash2 } from 'lucide-react';
import { formatQty } from '../../utils/index';

export const DataTable = ({ data, title, filterType, isLoading, onEdit, onDelete }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const filteredData = useMemo(() => {
    let result = filterType ? data.filter((d: any) => d.type === filterType) : data;
    
    // 1. Keyword Search
    if (searchTerm) {
      result = result.filter((item: any) => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 2. Global Category Filter
    if (selectedCategory !== '全部') {
      result = result.filter((item: any) => {
        if (selectedCategory === '燃油') {
          return item.type === '燃油采购';
        }
        if (selectedCategory === '日常收入') {
          return item.type === '收入';
        }
        if (selectedCategory === '日常支出') {
          return item.type === '支出';
        }
        // Match specific equipment categories
        const matchCategory = item.category === selectedCategory;
        const matchKeyword = (item.title && item.title.includes(selectedCategory));
        return matchCategory || matchKeyword;
      });
    }

    // 3. Date Range Filter
    if (startDate) {
      result = result.filter((item: any) => item.date >= startDate);
    }
    if (endDate) {
      result = result.filter((item: any) => item.date <= endDate);
    }

    return result;
  }, [data, filterType, searchTerm, selectedCategory, startDate, endDate]);

  const totalAmount = useMemo(() => filteredData.reduce((sum: number, item: any) => sum + Number(item.amount), 0), [filteredData]);
  const totalQty = useMemo(() => {
    return filteredData.reduce((sum: number, item: any) => {
      const qStr = (item.quantity || '0').toString().replace(/[^\d.]/g, '');
      const qNum = parseFloat(qStr);
      return sum + (isNaN(qNum) ? 0 : qNum);
    }, 0);
  }, [filteredData]);

  // Determine categories to show based on view
  const categories = useMemo(() => {
    if (filterType === '设备采购') {
      return ['全部', '油箱', '炉灶', '煲仔炉', '汤炉', '蒸柜', '运费', '其他配件'];
    }
    if (filterType === '燃油采购') {
      return null;
    }
    // Accounting / History views
    return ['全部', '燃油', '油箱', '炉灶', '煲仔炉', '汤炉', '蒸柜', '运费', '其他配件', '日常收入', '日常支出'];
  }, [filterType]);

  return (
    <div className="glass-card p-8 mb-6 overflow-hidden relative min-h-[300px]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-primary transition-colors text-white" 
            />
            <span className="text-slate-500 text-xs">至</span>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-bg-secondary border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-primary transition-colors text-white" 
            />
          </div>
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
      </div>

      {categories && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat 
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Global Summary Cards */}
      <div className={`grid ${totalQty > 0 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-8 animate-in fade-in slide-in-from-top-2 duration-300`}>
         <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
              {selectedCategory === '全部' ? '筛选范围内总额' : `${selectedCategory}总额`}
            </p>
            <p className="text-2xl font-black text-white">¥ {totalAmount.toLocaleString()}</p>
         </div>
         {totalQty > 0 && (
           <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
              <p className="text-[10px] text-brand-primary uppercase font-bold tracking-wider mb-1">
                {selectedCategory === '全部' ? '筛选范围内总量' : `${selectedCategory}总量`}
              </p>
              <p className="text-2xl font-black text-brand-primary">
                {totalQty.toLocaleString()} <span className="text-xs font-normal">
                  {selectedCategory === '燃油' || filterType === '燃油采购' ? 'kg' : '个/kg'}
                </span>
              </p>
           </div>
         )}
      </div>

      {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/50 z-10"><Loader2 className="animate-spin text-brand-primary" /></div>}
      
      {/* Desktop Table */}
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
            {filteredData.map((item: any) => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                <td className="py-4 text-slate-400 text-sm">{item.date}</td>
                <td className="py-4 flex items-center gap-2">
                  {item.type === '收入' ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-rose-400" />}
                  <div>
                    <span>{item.title}</span>
                    {item.category && (
                      <span className="ml-2 px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] rounded border border-brand-primary/20">
                        {item.category}
                      </span>
                    )}
                  </div>
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredData.map((item: any) => (
          <div key={item.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {item.type === '收入' ? <ArrowUpRight size={16} className="text-emerald-400" /> : <ArrowDownRight size={16} className="text-rose-400" />}
                <div>
                  <div className="text-sm font-bold text-white">{item.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-black text-white">¥ {Number(item.amount).toLocaleString()}</div>
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
                {item.notes}
              </div>
            )}
            
            <div className="flex justify-end gap-4 pt-2 border-t border-white/5">
              <button onClick={() => onEdit(item)} className="text-xs text-slate-400 flex items-center gap-1 hover:text-brand-primary">
                <Edit2 size={14} /> 编辑
              </button>
              <button onClick={() => onDelete(item.id)} className="text-xs text-slate-400 flex items-center gap-1 hover:text-rose-400">
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
