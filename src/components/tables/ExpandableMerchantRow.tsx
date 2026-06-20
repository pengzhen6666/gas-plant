import { useState, useMemo } from 'react';
import { Users, ChevronUp, ChevronDown, Package, ArrowRight } from 'lucide-react';
import type { Transaction, MerchantSummary } from '../../types/index';

export const ExpandableMerchantRow = ({ merchant, transactions }: { merchant: MerchantSummary, transactions: Transaction[] }) => {
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
          <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
            <Users size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white truncate">{merchant.customer_name}</p>
            <p className="text-[10px] text-slate-500 truncate">{merchant.phone || '无电话'}</p>
            {merchant.assigned_equipment && (
              <p className="text-[10px] text-brand-primary flex items-center gap-1 mt-0.5">
                <Package size={8} /> {merchant.assigned_equipment}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="text-right">
            <div className="font-bold whitespace-nowrap text-brand-primary text-base md:text-lg">
              ¥{merchant.total_amount.toLocaleString()}
            </div>
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
