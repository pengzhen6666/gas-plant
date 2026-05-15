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
              onClick={() => {
                setFormData({ ...formData, title: preset.name });
                setPurchaseDetails({ ...purchaseDetails, density: preset.density.toString(), isAuto: true });
              }}
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
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-slate-500 font-bold uppercase">成品油价</label>
              <div className="flex bg-black/20 rounded-md p-0.5 border border-white/5">
                <button 
                  type="button"
                  onClick={() => setPurchaseDetails({...purchaseDetails, priceUnit: 'ton', isAuto: true})}
                  className={`px-1.5 py-0.5 text-[8px] font-bold rounded transition-all ${purchaseDetails.priceUnit === 'ton' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500'}`}
                >元/吨</button>
                <button 
                  type="button"
                  onClick={() => setPurchaseDetails({...purchaseDetails, priceUnit: 'barrel', isAuto: true})}
                  className={`px-1.5 py-0.5 text-[8px] font-bold rounded transition-all ${purchaseDetails.priceUnit === 'barrel' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500'}`}
                >元/桶</button>
              </div>
            </div>
            <input 
              type="number"
              className="w-full bg-bg-secondary border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={purchaseDetails.oilBasePrice}
              onChange={e => setPurchaseDetails({...purchaseDetails, oilBasePrice: e.target.value, isAuto: true})}
              placeholder={purchaseDetails.priceUnit === 'ton' ? "元/吨价格" : "每桶价格"}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase">订购桶数 (1000L/桶)</label>
            <input 
              type="number"
              className="w-full bg-bg-secondary border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={purchaseDetails.barrelCount}
              onChange={e => setPurchaseDetails({...purchaseDetails, barrelCount: e.target.value, isAuto: true})}
              placeholder="桶数"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase flex justify-between">
              燃油密度 (kg/L)
              <span className="text-brand-primary">1桶 ≈ {(parseFloat(purchaseDetails.density) * 1000).toFixed(0)}kg</span>
            </label>
            <input 
              type="number" step="0.001"
              className="w-full bg-bg-secondary border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={purchaseDetails.density}
              onChange={e => setPurchaseDetails({...purchaseDetails, density: e.target.value, isAuto: true})}
              placeholder="密度，如 0.85"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase">空桶押金/成本</label>
            <input 
              type="number"
              className="w-full bg-bg-secondary border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              value={purchaseDetails.barrelCost}
              onChange={e => setPurchaseDetails({...purchaseDetails, barrelCost: e.target.value, isAuto: true})}
              placeholder="每个桶的钱"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={purchaseDetails.useHandlingFee} 
                  onChange={e => setPurchaseDetails({...purchaseDetails, useHandlingFee: e.target.checked, isAuto: true})}
                  className="w-3 h-3 rounded border-white/20 bg-black/20 text-brand-primary focus:ring-0"
                />
                <span className={`text-[9px] font-bold transition-colors ${purchaseDetails.useHandlingFee ? 'text-brand-primary' : 'text-slate-500'}`}>手续费</span>
              </label>
              <div className="flex bg-black/20 rounded-md p-0.5 border border-white/5">
                <button 
                  type="button"
                  onClick={() => setPurchaseDetails({...purchaseDetails, handlingFeeMode: 'percent', isAuto: true})}
                  className={`px-1 py-0.5 text-[7px] font-bold rounded transition-all ${purchaseDetails.handlingFeeMode === 'percent' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500'}`}
                >%</button>
                <button 
                  type="button"
                  onClick={() => setPurchaseDetails({...purchaseDetails, handlingFeeMode: 'fixed', isAuto: true})}
                  className={`px-1 py-0.5 text-[7px] font-bold rounded transition-all ${purchaseDetails.handlingFeeMode === 'fixed' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500'}`}
                >¥</button>
              </div>
            </div>
            <input 
              type="number" step="0.01"
              className={`w-full bg-bg-secondary border rounded-lg px-2 py-1.5 text-xs text-white transition-opacity ${purchaseDetails.useHandlingFee ? 'border-brand-primary/30' : 'border-white/10 opacity-40'}`}
              value={purchaseDetails.handlingFeeMode === 'percent' ? purchaseDetails.handlingRate : purchaseDetails.handlingFeeFixed}
              onChange={e => setPurchaseDetails({
                ...purchaseDetails, 
                [purchaseDetails.handlingFeeMode === 'percent' ? 'handlingRate' : 'handlingFeeFixed']: e.target.value, 
                isAuto: true
              })}
              disabled={!purchaseDetails.useHandlingFee}
              placeholder={purchaseDetails.handlingFeeMode === 'percent' ? "%" : "金额"}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={purchaseDetails.useTaxFee} 
                  onChange={e => setPurchaseDetails({...purchaseDetails, useTaxFee: e.target.checked, isAuto: true})}
                  className="w-3 h-3 rounded border-white/20 bg-black/20 text-brand-primary focus:ring-0"
                />
                <span className={`text-[9px] font-bold transition-colors ${purchaseDetails.useTaxFee ? 'text-brand-primary' : 'text-slate-500'}`}>开票费</span>
              </label>
              <div className="flex bg-black/20 rounded-md p-0.5 border border-white/5">
                <button 
                  type="button"
                  onClick={() => setPurchaseDetails({...purchaseDetails, taxFeeMode: 'percent', isAuto: true})}
                  className={`px-1 py-0.5 text-[7px] font-bold rounded transition-all ${purchaseDetails.taxFeeMode === 'percent' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500'}`}
                >%</button>
                <button 
                  type="button"
                  onClick={() => setPurchaseDetails({...purchaseDetails, taxFeeMode: 'fixed', isAuto: true})}
                  className={`px-1 py-0.5 text-[7px] font-bold rounded transition-all ${purchaseDetails.taxFeeMode === 'fixed' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-500'}`}
                >¥</button>
              </div>
            </div>
            <input 
              type="number" step="0.01"
              className={`w-full bg-bg-secondary border rounded-lg px-2 py-1.5 text-xs text-white transition-opacity ${purchaseDetails.useTaxFee ? 'border-brand-primary/30' : 'border-white/10 opacity-40'}`}
              value={purchaseDetails.taxFeeMode === 'percent' ? purchaseDetails.taxRate : purchaseDetails.taxFeeFixed}
              onChange={e => setPurchaseDetails({
                ...purchaseDetails, 
                [purchaseDetails.taxFeeMode === 'percent' ? 'taxRate' : 'taxFeeFixed']: e.target.value, 
                isAuto: true
              })}
              disabled={!purchaseDetails.useTaxFee}
              placeholder={purchaseDetails.taxFeeMode === 'percent' ? "%" : "金额"}
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[9px] text-slate-500 font-bold">运费</label>
              <button 
                type="button"
                onClick={() => setPurchaseDetails({...purchaseDetails, isManualShipping: !purchaseDetails.isManualShipping, isAuto: true})}
                className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition-all ${!purchaseDetails.isManualShipping ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}
              >
                {!purchaseDetails.isManualShipping ? '自动' : '手动'}
              </button>
            </div>
            <input 
              type="number"
              className={`w-full bg-bg-secondary border rounded-lg px-2 py-1.5 text-xs text-white transition-all ${!purchaseDetails.isManualShipping ? 'border-emerald-400/30' : 'border-white/10'}`}
              value={purchaseDetails.shippingFee}
              onChange={e => setPurchaseDetails({...purchaseDetails, shippingFee: e.target.value, isManualShipping: true, isAuto: true})}
              placeholder="运费"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
