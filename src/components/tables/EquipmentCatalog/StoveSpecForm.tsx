import React from 'react';
import { STOVE_DIMENSIONS, STOVE_BURNERS, STOVE_BASINS } from '../../../config/equipment';
import type { FormattedPresets } from './types';

interface StoveSpecFormProps {
  category: string;
  specDim: string;
  setSpecDim: (v: string) => void;
  customSpecDim: string;
  setCustomSpecDim: (v: string) => void;
  specBurner: string;
  setSpecBurner: (v: string) => void;
  customSpecBurner: string;
  setCustomSpecBurner: (v: string) => void;
  specBasin: string;
  setSpecBasin: (v: string) => void;
  specSilent: boolean;
  setSpecSilent: (v: boolean) => void;
  specHandle: boolean;
  setSpecHandle: (v: boolean) => void;
  specFlameout: boolean;
  setSpecFlameout: (v: boolean) => void;
  formattedPresets: FormattedPresets;
  volumeLabel?: string | null;
  isEdit?: boolean;
}

export const StoveSpecForm = ({
  category,
  specDim, setSpecDim,
  customSpecDim, setCustomSpecDim,
  specBurner, setSpecBurner,
  customSpecBurner, setCustomSpecBurner,
  specBasin, setSpecBasin,
  specSilent, setSpecSilent,
  specHandle, setSpecHandle,
  specFlameout, setSpecFlameout,
  formattedPresets,
  volumeLabel,
  isEdit = false
}: StoveSpecFormProps) => {
  const selectClass = isEdit 
    ? "bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none"
    : "bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none";
    
  const inputClass = isEdit
    ? "bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none w-20 animate-in fade-in zoom-in-95 duration-200"
    : "bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none w-20 animate-in fade-in zoom-in-95 duration-200";

  return (
    <div className={`mt-3 space-y-3 ${isEdit ? 'p-2 bg-white/5 rounded-xl border border-white/5' : ''}`}>
      {category === '油箱' && volumeLabel && (
        <div className="text-[10px] text-emerald-400 font-bold bg-emerald-400/5 px-3 py-1 rounded-lg inline-flex items-center gap-2 border border-emerald-400/10 animate-in slide-in-from-top-1">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          系统自动估算容积: {volumeLabel} 升 (已扣除顶部空间)
        </div>
      )}

      {(['炉灶', '汤炉', '煲仔炉', '蒸柜'].includes(category)) && (
        <div className="flex flex-wrap items-center gap-3 animate-in slide-in-from-top-1 duration-300">
          {/* Dimensions */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-black uppercase">尺寸:</span>
            <select value={specDim} onChange={e => setSpecDim(e.target.value)} className={selectClass}>
              <option value="">-</option>
              {STOVE_DIMENSIONS.map(d => <option key={d} value={d}>{d}</option>)}
              {formattedPresets.dimensions.map(d => (
                <option key={d.id} value={d.value}>{d.value} (预设)</option>
              ))}
            </select>
            {specDim === '其他尺寸' && (
              <input 
                value={customSpecDim}
                onChange={e => setCustomSpecDim(e.target.value)}
                placeholder="输入尺寸"
                className={inputClass}
              />
            )}
          </div>

          {/* Burners */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-black uppercase">炉头:</span>
            <select value={specBurner} onChange={e => setSpecBurner(e.target.value)} className={selectClass}>
              <option value="">-</option>
              {STOVE_BURNERS.map(b => <option key={b} value={b}>{b}</option>)}
              {formattedPresets.burners.map(b => (
                <option key={b.id} value={b.value}>{b.value} (预设)</option>
              ))}
            </select>
            {specBurner === '其他炉头' && (
              <input 
                value={customSpecBurner}
                onChange={e => setCustomSpecBurner(e.target.value)}
                placeholder="输入炉头"
                className={inputClass}
              />
            )}
          </div>

          {/* Stoves only options */}
          {category === '炉灶' && (
            <>
              {/* Basin */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-black uppercase">盆口:</span>
                <select value={specBasin} onChange={e => setSpecBasin(e.target.value)} className={selectClass}>
                  <option value="">-</option>
                  {STOVE_BASINS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-4 ml-2">
                <label className="flex items-center gap-1.5 cursor-pointer group">
                  <input type="checkbox" checked={specSilent} onChange={e => setSpecSilent(e.target.checked)} className="hidden" />
                  <div className={`w-3.5 h-3.5 rounded border ${specSilent ? 'bg-brand-primary border-brand-primary' : 'border-white/20'} flex items-center justify-center transition-all`}>
                    {specSilent && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold group-hover:text-white transition-colors">静音</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer group">
                  <input type="checkbox" checked={specHandle} onChange={e => setSpecHandle(e.target.checked)} className="hidden" />
                  <div className={`w-3.5 h-3.5 rounded border ${specHandle ? 'bg-brand-primary border-brand-primary' : 'border-white/20'} flex items-center justify-center transition-all`}>
                    {specHandle && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold group-hover:text-white transition-colors">手柄开关</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer group">
                  <input type="checkbox" checked={specFlameout} onChange={e => setSpecFlameout(e.target.checked)} className="hidden" />
                  <div className={`w-3.5 h-3.5 rounded border ${specFlameout ? 'bg-brand-primary border-brand-primary' : 'border-white/20'} flex items-center justify-center transition-all`}>
                    {specFlameout && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold group-hover:text-white transition-colors">拉锅熄火</span>
                </label>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
