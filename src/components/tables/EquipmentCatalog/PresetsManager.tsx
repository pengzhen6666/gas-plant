import React from 'react';
import { Settings2, X } from 'lucide-react';
import { CATEGORIES } from '../../../config/equipment';
import type { FormattedPresets } from './types';

interface PresetsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  formattedPresets: FormattedPresets;
  onDeletePreset: (id: string) => void;
}

export const PresetsManager = ({ 
  isOpen, 
  onClose, 
  formattedPresets, 
  onDeletePreset 
}: PresetsManagerProps) => {
  if (!isOpen) return null;

  return (
    <div className="glass-card p-6 border-brand-primary/30 animate-in slide-in-from-top-4 duration-300 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Settings2 size={18} className="text-brand-primary" />
          管理自定义预设 (数据库持久化)
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Manufacturers */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">厂家预设</h4>
          <div className="flex flex-wrap gap-2">
            {formattedPresets.manufacturers.length === 0 && <span className="text-xs text-slate-600 italic">暂无自定义厂家</span>}
            {formattedPresets.manufacturers.map(m => (
              <div key={m.id} className="group flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-xs text-slate-300">
                {m.value}
                <button onClick={() => onDeletePreset(m.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">尺寸预设</h4>
          <div className="flex flex-wrap gap-2">
            {formattedPresets.dimensions.length === 0 && <span className="text-xs text-slate-600 italic">暂无自定义尺寸</span>}
            {formattedPresets.dimensions.map(d => (
              <div key={d.id} className="group flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-xs text-slate-300">
                {d.value}
                <button onClick={() => onDeletePreset(d.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Burners */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">炉头预设</h4>
          <div className="flex flex-wrap gap-2">
            {formattedPresets.burners.length === 0 && <span className="text-xs text-slate-600 italic">暂无自定义炉头</span>}
            {formattedPresets.burners.map(b => (
              <div key={b.id} className="group flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-xs text-slate-300">
                {b.value}
                <button onClick={() => onDeletePreset(b.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Models */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">型号预设 (按分类)</h4>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {CATEGORIES.map(cat => {
              const catModels = formattedPresets.models.filter(m => m.category === cat);
              if (catModels.length === 0) return null;
              return (
                <div key={cat} className="space-y-2">
                  <div className="text-[10px] text-brand-primary/60 font-bold">{cat}</div>
                  <div className="flex flex-wrap gap-2">
                    {catModels.map(m => (
                      <div key={m.id} className="group flex items-center gap-2 bg-brand-primary/5 border border-brand-primary/10 px-2 py-1 rounded-lg text-xs text-slate-300">
                        {m.value}
                        <button onClick={() => onDeletePreset(m.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {formattedPresets.models.length === 0 && <span className="text-xs text-slate-600 italic">暂无自定义型号</span>}
          </div>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500 italic">
        * 提示：所有的自定义型号、厂家、尺寸等预设现已同步至数据库，点击 X 即可清理。
      </div>
    </div>
  );
};
