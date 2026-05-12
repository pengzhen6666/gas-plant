import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ProfitCard } from './FuelCalculatorComponents';

interface ProfitVisualizationProps {
  results: any;
}

export const ProfitVisualization: React.FC<ProfitVisualizationProps> = ({ results }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8">
      <ProfitCard label="每升利润" value={results.profitL} purchase={results.purchaseL} sell={results.sellingL} />
      <ProfitCard label="每公斤利润" value={results.profitKg} purchase={results.purchaseKg} sell={results.sellingKg} />
      <ProfitCard label="每斤利润" value={results.profitJin} purchase={results.purchaseJin} sell={results.sellingJin} />

      <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-[2.5rem] p-8 flex flex-col justify-center relative overflow-hidden group/total">
        <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover/total:opacity-10 transition-opacity">
          <TrendingUp size={80} />
        </div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4">预计整批总利润</p>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black text-emerald-400">¥</span>
          <span className="text-4xl font-black text-white">{(results.totalProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
        </div>
        <p className="text-[9px] text-slate-600 font-bold mt-2 uppercase tracking-widest">基于当前进货总量核算</p>
      </div>

      <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group/margin">
        <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover/margin:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 text-center">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4">综合毛利率</p>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90">
              <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={263.89} strokeDashoffset={263.89 - (263.89 * (results.margin / 100))} className="text-brand-primary" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
            <span className="absolute text-xl font-black text-white">{results.margin.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
