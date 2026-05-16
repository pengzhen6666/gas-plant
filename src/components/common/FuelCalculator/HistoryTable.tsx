import { History as HistoryIcon, Calculator, Loader2, TrendingUp, Trash2, ChevronUp, ChevronDown, DollarSign } from 'lucide-react';
import type { FuelQuote } from '../../../types/index';
import { priceKgToL, priceKgToJin } from '../../../utils/index';

interface HistoryTableProps {
  quotes: FuelQuote[];
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  fuelTypes: { name: string, density: number }[];
  isLoading: boolean;
  unitType: 'kg' | 'L' | 'jin';
  sellingPrice: string;
  setSellingPrice: (val: string) => void;
  handleUnitChange: (unit: 'kg' | 'L' | 'jin') => void;
  onNewCalculation: () => void;
  onApplyRecord: (q: FuelQuote) => void;
  onDeleteRecord: (id: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  quotes,
  filterCategory,
  setFilterCategory,
  fuelTypes,
  isLoading,
  unitType,
  sellingPrice,
  setSellingPrice,
  handleUnitChange,
  onNewCalculation,
  onApplyRecord,
  onDeleteRecord
}) => {
  const filteredQuotes = quotes.filter(q => filterCategory === '全部' || q.notes?.includes(filterCategory));

  const targetPrice = Number(sellingPrice) || 0;

  return (
    <div className="glass-card overflow-hidden bg-[#0a0a0a]/80 backdrop-blur-3xl border-white/5">
      <div className="p-4 md:p-8 border-b border-white/5 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/[0.02]">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/20 rounded-lg">
              <HistoryIcon size={20} className="text-brand-primary" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest text-white">历史报价记录</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">点击行可查看详细计算详情</p>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide min-w-0">
            {['全部', ...fuelTypes.map(t => t.name)].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all whitespace-nowrap ${filterCategory === cat ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Target Selling Price Configurator */}
          <div className="flex items-center gap-3 bg-black/60 p-2 pl-4 rounded-[1.5rem] border border-white/10 shadow-2xl">
            <div className="flex flex-col pr-4 border-r border-white/5">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">设定售价 (元/{unitType === 'kg' ? 'KG' : unitType === 'jin' ? '斤' : '升'})</span>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.5"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="bg-transparent border-none p-0 text-amber-400 font-black text-xl focus:outline-none w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="flex flex-col">
                  <button 
                    onClick={() => setSellingPrice((targetPrice + 0.5).toFixed(1))}
                    className="p-0.5 hover:text-amber-400 text-slate-700 transition-colors"
                  ><ChevronUp size={12} /></button>
                  <button 
                    onClick={() => setSellingPrice(Math.max(0, targetPrice - 0.5).toFixed(1))}
                    className="p-0.5 hover:text-amber-400 text-slate-700 transition-colors"
                  ><ChevronDown size={12} /></button>
                </div>
              </div>
            </div>
            <div className="flex bg-black/40 p-1 rounded-xl gap-1">
              {(['kg', 'jin', 'L'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => handleUnitChange(u)}
                  className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all ${unitType === u ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-600 hover:text-white'}`}
                >
                  {u === 'kg' ? '公斤' : u === 'jin' ? '斤' : '升'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onNewCalculation}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-2xl transition-all font-black shadow-xl shadow-brand-primary/20 active:scale-95 group"
          >
            <Calculator size={16} className="group-hover:rotate-12 transition-transform" />
            新报价计算
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">日期</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">厂家报价</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">密度</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">折算吨桶</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">成本 ({unitType})</th>
              <th className="py-5 px-6 text-[11px] font-black text-amber-500/80 uppercase tracking-widest text-right">模拟盈利 ({unitType})</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">走势</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">备注/油品</th>
              <th className="py-5 px-6 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">操作</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {filteredQuotes.map((q, idx, arr) => {
              const prevSameNote = arr.slice(idx + 1).find(prev => prev.notes === q.notes);
              const diff = prevSameNote ? q.factory_price - prevSameNote.factory_price : 0;
              
              // Calculate real cost including shipping and packaging
              const d = q.density || 0.85;
              let realCostPerKg = 0;

              if (q.total_qty && q.total_qty > 0) {
                const grandTotal = (q.total_cost || 0) + (q.shipping_fee || 0) + (q.packaging_fee || 0);
                let qtyKg = 0;
                if (q.batch_unit === 'ton') qtyKg = q.total_qty * 1000;
                else if (q.batch_unit === 'kg') qtyKg = q.total_qty;
                else if (q.batch_unit === 'L') qtyKg = q.total_qty * d;
                
                realCostPerKg = grandTotal / qtyKg;
              } else {
                // Fallback to factory price if no specific batch data
                realCostPerKg = (q.factory_price || 0) / 1000;
              }

              let costInUnit = 0;
              if (unitType === 'kg') costInUnit = realCostPerKg;
              else if (unitType === 'L') costInUnit = priceKgToL(realCostPerKg, d);
              else if (unitType === 'jin') costInUnit = priceKgToJin(realCostPerKg);
              
              const profit = targetPrice - costInUnit;
              const margin = targetPrice > 0 ? (profit / targetPrice) * 100 : 0;

              return (
                <tr
                  key={q.id}
                  onClick={() => onApplyRecord(q)}
                  className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-all group cursor-pointer"
                >
                  <td className="py-5 px-6 text-slate-400 font-bold text-xs">{q.date}</td>
                  <td className="py-5 px-6 font-black text-white text-base">¥{(q.factory_price || 0).toLocaleString()}</td>
                  <td className="py-5 px-6 text-slate-400 font-black text-center">{q.density}</td>
                  <td className="py-5 px-6 font-black text-emerald-400 text-center">¥{(q.ton_barrel_price || 0).toLocaleString()}</td>
                  <td className="py-5 px-6 font-black text-brand-primary text-right">¥{costInUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-base font-black ${profit > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {profit > 0 ? '+' : ''}¥{profit.toFixed(2)}
                      </span>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                        利润率 {margin.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    {diff !== 0 && (
                      <div className={`flex items-center gap-1.5 font-black text-[11px] px-3 py-1.5 rounded-lg w-fit ${diff > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {diff > 0 ? <TrendingUp size={14} className="rotate-0" /> : <TrendingUp size={14} className="rotate-180" />}
                        ¥{Math.abs(diff).toFixed(0)}
                      </div>
                    )}
                    {diff === 0 && prevSameNote && <span className="text-[11px] font-black text-slate-600 bg-white/5 px-3 py-1.5 rounded-lg">持平</span>}
                    {!prevSameNote && <span className="text-[11px] font-black text-slate-700">-</span>}
                  </td>
                  <td className="py-5 px-6 text-slate-400 font-black text-xs italic">{q.notes || '-'}</td>
                  <td className="py-5 px-6 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRecord(q.id);
                      }}
                      className="p-3 bg-rose-500/5 text-slate-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3 p-3">
        {filteredQuotes.map((q, idx, arr) => {
          const prevSameNote = arr.slice(idx + 1).find(prev => prev.notes === q.notes);
          const diff = prevSameNote ? q.factory_price - prevSameNote.factory_price : 0;
          
          const d = q.density || 0.85;
          let realCostPerKg = 0;

          if (q.total_qty && q.total_qty > 0) {
            const grandTotal = (q.total_cost || 0) + (q.shipping_fee || 0) + (q.packaging_fee || 0);
            let qtyKg = 0;
            if (q.batch_unit === 'ton') qtyKg = q.total_qty * 1000;
            else if (q.batch_unit === 'kg') qtyKg = q.total_qty;
            else if (q.batch_unit === 'L') qtyKg = q.total_qty * d;
            
            realCostPerKg = grandTotal / qtyKg;
          } else {
            realCostPerKg = (q.factory_price || 0) / 1000;
          }

          let costInUnit = 0;
          if (unitType === 'kg') costInUnit = realCostPerKg;
          else if (unitType === 'L') costInUnit = priceKgToL(realCostPerKg, d);
          else if (unitType === 'jin') costInUnit = priceKgToJin(realCostPerKg);
          
          const profit = targetPrice - costInUnit;
          const margin = targetPrice > 0 ? (profit / targetPrice) * 100 : 0;

          return (
            <div 
              key={q.id}
              onClick={() => onApplyRecord(q)}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3 active:scale-[0.98] transition-all shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-lg font-black text-white">¥{(q.factory_price || 0).toLocaleString()}</h5>
                    <span className="text-[10px] text-slate-600 font-bold">元/吨</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{q.date}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${profit > 0 ? 'bg-amber-400/10 text-amber-400' : 'bg-rose-400/10 text-rose-400'}`}>
                    <DollarSign size={10} />
                    利润: ¥{profit.toFixed(2)}
                  </div>
                  {diff !== 0 && (
                    <div className={`text-[9px] font-black ${diff > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {diff > 0 ? '↑' : '↓'} ¥{Math.abs(diff).toFixed(0)}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.03]">
                <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5">
                  <span className="block text-[8px] text-slate-600 font-black uppercase mb-1">单位成本 ({unitType})</span>
                  <span className="text-xs font-black text-brand-primary">¥{costInUnit.toFixed(2)}</span>
                </div>
                <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5">
                  <span className="block text-[8px] text-slate-600 font-black uppercase mb-1">利润率</span>
                  <span className={`text-xs font-black ${margin > 0 ? 'text-amber-400' : 'text-rose-400'}`}>{margin.toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-[9px] text-slate-500 font-bold">
                <div className="flex gap-3">
                  <span>密度: {q.density}</span>
                  <span>吨桶: ¥{(q.ton_barrel_price || 0).toLocaleString()}</span>
                </div>
                <p className="truncate max-w-[120px] italic">{q.notes || '常规'}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isLoading && quotes.length === 0 && (
        <div className="py-20 md:py-32 text-center">
          <Loader2 size={32} className="animate-spin text-brand-primary mx-auto mb-4" />
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">正在极速加载历史数据...</p>
        </div>
      )}
      {!isLoading && quotes.length === 0 && (
        <div className="py-20 md:py-32 text-center">
          <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
            <Calculator size={32} className="text-slate-700" />
          </div>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">暂无历史数据记录</p>
        </div>
      )}
    </div>
  );
};
