import React from 'react';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  purchaseDetails: any;
  setPurchaseDetails: (data: any) => void;
  fuelPresets: any[];
  setFuelPresets: (presets: any[]) => void;
}

export const FuelPurchaseSection: React.FC<Props> = ({
  formData, setFormData, purchaseDetails, setPurchaseDetails, fuelPresets, setFuelPresets
}) => {
  return (
    <div className="space-y-4">
      {fuelPresets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="w-full flex justify-between items-center mb-1">
            <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">选择燃油品类:</p>
            {!fuelPresets.find(p => p.name === formData.title) && formData.title && (
              <button
                type="button"
                onClick={() => {
                  const newPresets = [...fuelPresets, { name: formData.title, density: 0.85 }];
                  setFuelPresets(newPresets);
                  localStorage.setItem('fuel_presets', JSON.stringify(newPresets));
                }}
                className="px-2 py-1 bg-emerald-400 text-black text-[9px] font-black rounded hover:bg-emerald-300 transition-all"
              >
                存为新模板
              </button>
            )}
          </div>
          {fuelPresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setFormData({ ...formData, title: preset.name })}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border ${
                formData.title === preset.name 
                  ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-brand-primary/40'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm text-slate-400">品类名称</label>
        <input 
          type="text" 
          className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
          placeholder="输入或点击上方型号..."
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase">成品油价 (元/吨)</label>
            <input 
              type="number"
              className="w-full bg-bg-secondary border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={purchaseDetails.oilBasePrice}
              onChange={e => setPurchaseDetails({...purchaseDetails, oilBasePrice: e.target.value, isAuto: true})}
              placeholder="如: 6825"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase">订购桶数</label>
            <input 
              type="number"
              className="w-full bg-bg-secondary border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={purchaseDetails.barrelCount}
              onChange={e => setPurchaseDetails({...purchaseDetails, barrelCount: e.target.value, isAuto: true})}
              placeholder="桶数"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-bold">手续费%</label>
            <input 
              type="number" step="0.01"
              className="w-full bg-bg-secondary border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
              value={purchaseDetails.handlingRate}
              onChange={e => setPurchaseDetails({...purchaseDetails, handlingRate: e.target.value, isAuto: true})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-bold">开票费%</label>
            <input 
              type="number" step="0.01"
              className="w-full bg-bg-secondary border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white"
              value={purchaseDetails.taxRate}
              onChange={e => setPurchaseDetails({...purchaseDetails, taxRate: e.target.value, isAuto: true})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-bold">预估运费</label>
            <div className="h-[34px] flex items-center px-2 bg-black/20 rounded-lg text-xs text-emerald-400 font-bold">
              ¥{purchaseDetails.shippingFee}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
