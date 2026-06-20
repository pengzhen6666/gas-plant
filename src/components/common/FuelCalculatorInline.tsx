import React from 'react';
import { RotateCcw, ArrowRightLeft, Save, Info, X } from 'lucide-react';
import { DetailInput } from './FuelCalculator/FuelCalculatorComponents';
import { ProfitVisualization } from './FuelCalculator/ProfitVisualization';

interface FuelCalculatorInlineProps {
  states: any;
  actions: any;
}

export const FuelCalculatorInline: React.FC<FuelCalculatorInlineProps> = ({
  states,
  actions
}) => {
  return (
    <div className="glass-card relative w-full bg-[#080808]/40 border-white/5 shadow-2xl p-6 md:p-8 space-y-8 rounded-[2rem]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">报价测算工作台</span>
        </div>
        <button
          type="button"
          onClick={actions.clearAll}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-xl transition-all text-[10px] font-black border border-white/5"
        >
          <RotateCcw size={12} /> <span>重置参数</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Step 1: Base Parameters */}
        <div className="xl:col-span-4 space-y-4">
          <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-5 h-5 rounded-lg bg-emerald-400/20 flex items-center justify-center text-[10px]">1</span>
            基础参数与厂家报价
          </p>
          <div className="bg-white/[0.01] border border-white/5 p-5 rounded-[1.5rem] space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                  燃油密度 (kg/L)
                  <Info size={11} className="text-slate-700 cursor-help" />
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={states.density}
                  onChange={(e) => actions.setDensity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-black text-sm focus:outline-none focus:border-brand-primary/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">厂家单价 (元/吨)</label>
                <input
                  type="number"
                  value={states.factoryQuote}
                  onChange={(e) => actions.setFactoryQuote(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-black text-sm focus:outline-none focus:border-emerald-400/50 transition-all"
                />
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4 shadow-inner">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                <ArrowRightLeft size={12} className="text-emerald-400" /> 密度辅助换算
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    placeholder="公斤"
                    value={states.helperKg}
                    onChange={(e) => {
                      const kg = e.target.value;
                      actions.setHelperKg(kg);
                      const d = Number(states.density) || 0.85;
                      if (kg && d > 0) actions.setHelperL((Number(kg) / d).toFixed(1));
                      else actions.setHelperL('');
                    }}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[12px] text-white font-black focus:outline-none focus:border-brand-primary/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-700 font-black">KG</span>
                </div>
                <ArrowRightLeft size={14} className="text-slate-700" />
                <div className="flex-1 relative">
                  <input
                    type="number"
                    placeholder="升"
                    value={states.helperL}
                    onChange={(e) => {
                      const l = e.target.value;
                      actions.setHelperL(l);
                      const d = Number(states.density) || 0.85;
                      if (l && d > 0) actions.setHelperKg((Number(l) * d).toFixed(1));
                      else actions.setHelperKg('');
                    }}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[12px] text-white font-black focus:outline-none focus:border-brand-primary/30"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-700 font-black">L</span>
                </div>
                <button
                  type="button"
                  onClick={actions.applyDensityHelper}
                  className="px-3 py-2 bg-emerald-400 text-black text-[10px] font-black rounded-xl hover:bg-emerald-300 transition-all active:scale-95 shadow-lg shadow-emerald-400/20"
                >
                  应用
                </button>
              </div>
            </div>

            <div className="bg-emerald-400/5 p-4 rounded-[1.2rem] border border-emerald-400/10 flex items-center justify-between">
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">自定义桶容</p>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                    <input
                      type="number"
                      value={states.barrelVol}
                      onChange={(e) => actions.setBarrelVol(e.target.value)}
                      className="w-12 bg-transparent text-[11px] text-emerald-400 font-black focus:outline-none text-center"
                    />
                    <span className="text-[9px] text-slate-700 font-black ml-1">L</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-black text-xl">¥</span>
                  <input
                    type="number"
                    value={isNaN(states.currentBarrelPrice) || states.currentBarrelPrice === 0 ? '' : states.currentBarrelPrice.toFixed(2)}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const d = Number(states.density) || 0.85;
                      const vol = Number(states.barrelVol) || 1000;
                      if (val > 0 && d > 0 && vol > 0) {
                        const pricePerL = val / vol;
                        actions.setFactoryQuote(((pricePerL * 1000) / d).toFixed(2));
                      } else {
                        actions.setFactoryQuote('');
                      }
                    }}
                    placeholder="输入整桶价反推"
                    className="bg-transparent border-none p-0 text-emerald-400 font-black text-xl focus:outline-none w-full placeholder:text-emerald-400/20"
                  />
                </div>
              </div>
              <button type="button" onClick={actions.applyTonBarrel} className="px-5 py-2.5 bg-emerald-400 text-black hover:bg-emerald-300 text-[11px] font-black rounded-xl transition-all shadow-xl shadow-emerald-400/20 active:scale-95">
                反推
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">已存油品种类 (点击加载)</label>
              <div className="flex flex-wrap gap-2 p-2 bg-black/30 rounded-2xl border border-white/5 max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                {states.fuelTypes.map((t: any) => (
                  <div key={t.id || t.name} className={`relative flex items-center bg-white/5 border rounded-xl px-3 py-1.5 transition-all text-xs font-black text-white group/preset ${states.notes === t.name ? 'border-brand-primary/50 bg-brand-primary/5' : 'border-white/10 hover:border-white/20'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        actions.setNotes(t.name);
                        actions.setDensity(String(t.density));
                      }}
                      className="text-left hover:text-brand-primary transition-all text-[11px]"
                    >
                      {t.name} <span className="text-[9px] text-slate-500 font-normal">({t.density})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => actions.deletePreset(t.id || t.name)}
                      className="ml-2 w-4 h-4 rounded-full bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-all text-[9px]"
                      title="删除此模板"
                    >
                      <X size={8} />
                    </button>
                  </div>
                ))}
                {states.fuelTypes.length === 0 && (
                  <div className="text-[10px] text-slate-600 font-bold p-1">暂无油品模板，输入品名及密度后可存为模板</div>
                )}
              </div>
              <div className="flex gap-2">
                <input type="date" value={states.recordDate} onChange={e => actions.setRecordDate(e.target.value)} className="w-[110px] bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-white text-[10px] font-black focus:outline-none" />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={states.notes}
                    onChange={e => actions.setNotes(e.target.value)}
                    placeholder="品名(如:宁煤)"
                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-white text-[10px] font-black focus:outline-none"
                  />
                  {!states.fuelTypes.find((t: any) => t.name === states.notes) && states.notes && states.density && (
                    <button
                      type="button"
                      onClick={() => {
                        if (states.notes && !isNaN(Number(states.density))) {
                          actions.addPreset(states.notes, Number(states.density));
                        }
                      }}
                      className="px-3 py-2 bg-emerald-400 text-black text-[9px] font-black rounded-xl hover:bg-emerald-300 transition-all active:scale-95 whitespace-nowrap"
                    >
                      存为模板
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={actions.saveQuote}
                disabled={!states.factoryQuote || states.isSaving}
                className="w-full py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-black bg-brand-primary text-white shadow-xl shadow-brand-primary/20"
              >
                {states.isSaving ? '正在保存...' : <><Save size={14} /> 保存计算存档</>}
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Cost Calculation */}
        <div className="xl:col-span-5 space-y-4">
          <p className="text-[11px] font-black text-brand-primary uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-5 h-5 rounded-lg bg-brand-primary/20 flex items-center justify-center text-[10px]">2</span>
            进货成本核算
          </p>
          <div className="bg-white/[0.01] border border-white/5 p-6 rounded-[1.5rem] space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <DetailInput label="货款金额" value={states.totalCost} onChange={actions.setTotalCost} />
              <DetailInput label="运费" value={states.shippingFee} onChange={actions.setShippingFee} />
              <DetailInput label="杂费" value={states.packagingFee} onChange={actions.setPackagingFee} />
            </div>

            <div className="space-y-3">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">进货总量 ({states.batchUnit})</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={states.totalQty}
                  onChange={(e) => actions.setTotalQty(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-black text-sm focus:outline-none focus:border-brand-primary/50 transition-all"
                />
                <select
                  value={states.batchUnit}
                  onChange={(e) => {
                    const newUnit = e.target.value as any;
                    const qty = Number(states.totalQty);
                    const d = Number(states.density) || 0.85;
                    if (qty > 0) {
                      let baseKg = states.batchUnit === 'ton' ? qty * 1000 : (states.batchUnit === 'L' ? qty * d : qty);
                      let newQty = newUnit === 'ton' ? baseKg / 1000 : (newUnit === 'L' ? baseKg / d : baseKg);
                      actions.setTotalQty(newQty.toFixed(newUnit === 'ton' ? 3 : 1));
                    }
                    actions.setBatchUnit(newUnit);
                  }}
                  className="w-28 bg-white/5 border border-white/10 rounded-xl px-3 text-white font-black text-xs focus:outline-none"
                >
                  <option value="ton">吨 (t)</option>
                  <option value="kg">公斤 (kg)</option>
                  <option value="L">升 (L)</option>
                </select>
              </div>
              <div className="flex gap-4 px-1">
                {(() => {
                  const qty = Number(states.totalQty) || 0;
                  const d = Number(states.density) || 0.85;
                  let l = states.batchUnit === 'L' ? qty : (states.batchUnit === 'ton' ? qty * 1000 / d : qty / d);
                  let kg = states.batchUnit === 'kg' ? qty : (states.batchUnit === 'ton' ? qty * 1000 : qty * d);
                  return (
                    <>
                      <span className="text-[10px] text-slate-500 font-bold">≈ {l.toFixed(1)} L</span>
                      <span className="text-[10px] text-slate-500 font-bold">≈ {kg.toFixed(1)} kg</span>
                      <span className="text-[10px] text-slate-500 font-bold">≈ {(kg / 1000).toFixed(3)} t</span>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-[1rem] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-slate-500 font-black uppercase mb-0.5">总投入成本</p>
                  <p className="text-lg font-black text-brand-primary">¥{((Number(states.totalCost) || 0) + (Number(states.shippingFee) || 0) + (Number(states.packagingFee) || 0)).toFixed(1)}</p>
                </div>
              </div>
              <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-[1rem] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[8px] text-slate-500 font-black uppercase mb-0.5">单位成本 ({states.unitType})</p>
                  <p className="text-lg font-black text-brand-primary">¥{(Number(states.purchasePrice) || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Selling Price Configuration */}
        <div className="xl:col-span-3 space-y-4">
          <p className="text-[11px] font-black text-amber-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-5 h-5 rounded-lg bg-amber-400/20 flex items-center justify-center text-[10px]">3</span>
            期望利润配置
          </p>
          <div className="bg-white/[0.01] border border-white/5 p-6 rounded-[1.5rem] space-y-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 tracking-widest">设定售价 (元/{states.unitType})</label>
              <input
                type="number"
                value={states.sellingPrice}
                onChange={(e) => actions.setSellingPrice(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-amber-400 font-black text-2xl focus:outline-none focus:border-amber-400/50 transition-all"
                placeholder="0.00"
              />
            </div>
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              {(['kg', 'jin', 'L'] as const).map((u) => (
                <button
                  type="button"
                  key={u}
                  onClick={() => actions.handleUnitChange(u)}
                  className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${states.unitType === u ? 'bg-brand-primary text-white shadow' : 'text-slate-600 hover:text-white'}`}
                >
                  按{u === 'kg' ? '公斤' : u === 'jin' ? '斤' : '升'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profit Visualization Section */}
      <ProfitVisualization results={states.results} />
    </div>
  );
};
