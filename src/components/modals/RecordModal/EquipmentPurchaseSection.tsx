import React from 'react';
import { CATEGORIES } from '../../../config/equipment';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  equipmentCatalog: any[];
  parseEquipName: (name: string) => any;
}

export const EquipmentPurchaseSection: React.FC<Props> = ({
  formData, setFormData, equipmentCatalog, parseEquipName
}) => {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm text-slate-400">摘要内容 (型号/名称)</label>
        {equipmentCatalog && equipmentCatalog.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="w-full text-[10px] text-brand-primary font-bold mb-1 uppercase tracking-wider">从资产库点选型号:</p>
            {equipmentCatalog.map((item: any) => {
              const { mfr, model } = parseEquipName(item.name);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const parsed = parseEquipName(item.name);
                    setFormData({
                      ...formData, 
                      title: `${parsed.mfr} ${parsed.model}`,
                      unit_price: item.price.toString(),
                      category: parsed.category
                    });
                  }}
                  className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all"
                >
                  {mfr} {model} (¥{item.price})
                </button>
              );
            })}
          </div>
        )}

        <input 
          type="text" 
          className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
          placeholder="输入或点击上方型号..."
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-brand-primary font-bold">设备种类</label>
        <select 
          className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
          value={formData.category}
          onChange={e => setFormData({...formData, category: e.target.value})}
        >
          <option value="">-- 请选择设备种类 --</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
};
