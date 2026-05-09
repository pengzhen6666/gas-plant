

export const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend, isHighlight }: any) => (
  <div className={`glass-card p-6 border-l-4 ${isHighlight ? 'bg-brand-primary/5 border-l-brand-primary shadow-xl shadow-brand-primary/5' : `border-l-${colorClass}`}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${isHighlight ? 'bg-brand-primary/20' : `bg-${colorClass}/10`}`}>
        <Icon size={24} className={isHighlight ? 'text-brand-primary' : `text-${colorClass}`} />
      </div>
      {trend !== undefined && (
        <span className={`font-semibold text-sm ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className={`text-2xl font-bold mt-1 ${isHighlight ? 'text-white' : ''}`}>{value}</p>
    {subValue && <p className="text-slate-500 text-xs mt-1">{subValue}</p>}
  </div>
);
