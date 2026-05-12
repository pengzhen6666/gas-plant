import React from 'react';
import { History as HistoryIcon, Calculator, Loader2, TrendingUp, Trash2 } from 'lucide-react';
import type { FuelQuote } from '../../../types/index';

interface HistoryTableProps {
  quotes: FuelQuote[];
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  fuelTypes: { name: string, density: number }[];
  isLoading: boolean;
  unitType: string;
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
  onNewCalculation,
  onApplyRecord,
  onDeleteRecord
}) => {
  const filteredQuotes = quotes.filter(q => filterCategory === '全部' || q.notes?.includes(filterCategory));

  return (
    <div className="glass-card overflow-hidden bg-white/[0.01] border-white/5">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/20 rounded-lg">
            <HistoryIcon size={20} className="text-brand-primary" />
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-widest text-white">历史报价记录</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">点击行可查看详细计算详情</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={onNewCalculation}
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-xl transition-all font-black shadow-xl shadow-brand-primary/20 active:scale-95 group mr-4"
          >
            <Calculator size={16} className="group-hover:rotate-12 transition-transform" />
            新报价计算
          </button>
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
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
          {isLoading && <Loader2 size={16} className="animate-spin text-brand-primary ml-2" />}
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            共 {filteredQuotes.length} 条记录
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">日期</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">厂家报价</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">密度</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">折算吨桶</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">成本 ({unitType})</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">走势</th>
              <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">备注/油品</th>
              <th className="py-5 px-6 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">操作</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {filteredQuotes.map((q, idx, arr) => {
              const prevSameNote = arr.slice(idx + 1).find(prev => prev.notes === q.notes);
              const diff = prevSameNote ? q.factory_price - prevSameNote.factory_price : 0;

              return (
                <tr
                  key={q.id}
                  onClick={() => onApplyRecord(q)}
                  className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-all group cursor-pointer"
                >
                  <td className="py-5 px-6 text-slate-400 font-bold text-xs">{q.date}</td>
                  <td className="py-5 px-6 font-black text-white text-base">¥{(q.factory_price || 0).toLocaleString()}</td>
                  <td className="py-5 px-6 text-slate-400 font-black">{q.density}</td>
                  <td className="py-5 px-6 font-black text-emerald-400">¥{(q.ton_barrel_price || 0).toLocaleString()}</td>
                  <td className="py-5 px-6 font-black text-brand-primary">¥{(q.total_cost || 0).toLocaleString()}</td>
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
        {isLoading && quotes.length === 0 && (
          <div className="py-32 text-center">
            <Loader2 size={40} className="animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-slate-500 font-black uppercase tracking-[0.2em]">正在极速加载历史数据...</p>
          </div>
        )}
        {!isLoading && quotes.length === 0 && (
          <div className="py-32 text-center">
            <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
              <Calculator size={40} className="text-slate-700" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-[0.2em]">暂无历史数据记录</p>
          </div>
        )}
      </div>
    </div>
  );
};
