import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ProfitCard } from './FuelCalculatorComponents';

interface ProfitVisualizationProps {
  results: any;
}

export const ProfitVisualization: React.FC<ProfitVisualizationProps> = ({ results }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-8">
      <ProfitCard label="每升利润" value={results.profitL} purchase={results.purchaseL} sell={results.sellingL} />
      <ProfitCard label="每公斤利润" value={results.profitKg} purchase={results.purchaseKg} sell={results.sellingKg} />
      <ProfitCard label="每斤利润" value={results.profitJin} purchase={results.purchaseJin} sell={results.sellingJin} />

      <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-center relative overflow-hidden group/total">
        <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover/total:opacity-10 transition-opacity">
          <TrendingUp size={60} className="md:w-[80px] md:h-[80px]" />
        </div>
        <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-4">预计整批总利润</p>
        <div className="flex items-baseline gap-1 md:gap-2">
          <span className="text-xs md:text-sm font-black text-emerald-400">¥</span>
          <span className="text-2xl md:text-4xl font-black text-white">{(results.totalProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
        </div>
        <p className="text-[8px] md:text-[9px] text-slate-600 font-bold mt-1 md:mt-2 uppercase tracking-widest">基于当前进货总量核算</p>
      </div>

      <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden group/margin">
        <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover/margin:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 text-center">
          <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-4">综合毛利率</p>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-16 h-16 md:w-24 md:h-24 -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="40" 
                className="text-white/5" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="transparent" 
              />
              <circle 
                cx="50" cy="50" r="40" 
                className="text-brand-primary" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * (results.margin / 100))} 
                strokeLinecap="round" 
                style={{ 
                  transition: 'stroke-dashoffset 1s ease-out',
                }} 
              />
            </svg>
            <span className="absolute text-sm md:text-xl font-black text-white">{results.margin.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
