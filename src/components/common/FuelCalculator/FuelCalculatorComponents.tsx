
import { ArrowRightLeft } from 'lucide-react';

export const DetailInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-black text-base focus:outline-none focus:border-brand-primary/30 transition-all"
    />
  </div>
);

export const ProfitCard = ({ label, value, purchase, sell }: { label: string, value: number, purchase: number, sell: number }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6 hover:bg-white/[0.04] transition-all group">
    <div className="flex justify-between items-center">
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">{label}</p>
      <div className={`px-3 py-1 rounded-full text-[9px] font-black ${value >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
        {value >= 0 ? '+' : ''}{value.toFixed(3)}
      </div>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[9px] text-slate-600 font-black uppercase">进货</p>
          <p className="text-xl font-black text-white">¥{purchase.toFixed(3)}</p>
        </div>
        <ArrowRightLeft size={16} className="text-slate-800 mb-1" />
        <div className="space-y-1 text-right">
          <p className="text-[9px] text-slate-600 font-black uppercase">预售</p>
          <p className="text-xl font-black text-amber-400">¥{sell.toFixed(3)}</p>
        </div>
      </div>
    </div>
  </div>
);
