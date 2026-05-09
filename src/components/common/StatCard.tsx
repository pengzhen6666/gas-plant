export const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend, isHighlight }: any) => (
  <div className={`glass-card p-4 md:p-5 border-l-2 relative overflow-hidden group ${isHighlight ? 'bg-brand-primary/5 border-l-brand-primary' : `border-l-${colorClass}`}`}>
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${isHighlight ? 'bg-brand-primary/20' : `bg-${colorClass}/10`}`}>
        <Icon size={18} className={isHighlight ? 'text-brand-primary' : `text-${colorClass}`} />
      </div>
      {trend !== undefined && (
        <span className={`font-black text-[10px] ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend >= 0 ? '↑' : '↓'}{Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</h3>
    <p className={`text-xl font-black mt-0.5 tracking-tight ${isHighlight ? 'text-white' : 'text-slate-200'}`}>{value}</p>
    {subValue && <p className="text-slate-500 text-[9px] mt-0.5 font-bold italic">{subValue}</p>}
  </div>
);
