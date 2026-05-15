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
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = React.useState<string | null>(null);

  const manufacturers = React.useMemo(() => {
    const list = equipmentCatalog.map(item => parseEquipName(item.name).mfr);
    return Array.from(new Set(list)).sort();
  }, [equipmentCatalog]);

  const filteredCatalog = React.useMemo(() => {
    let result = equipmentCatalog;
    if (selectedCategory) {
      result = result.filter(item => parseEquipName(item.name).category === selectedCategory);
    }
    if (selectedManufacturer) {
      result = result.filter(item => parseEquipName(item.name).mfr === selectedManufacturer);
    }
    return result;
  }, [equipmentCatalog, selectedCategory, selectedManufacturer]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm text-slate-400">摘要内容 (型号/名称)</label>
        {equipmentCatalog && equipmentCatalog.length > 0 && (
          <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-2 pb-2 border-b border-white/5">
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[9px] text-slate-500 font-bold self-center mr-1">品类:</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`px-2 py-1 text-[9px] font-bold rounded transition-all border ${!selectedCategory ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white/5 text-slate-500 border-white/5'}`}
                >
                  全部
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 text-[9px] font-bold rounded transition-all border ${selectedCategory === cat ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white/5 text-slate-500 border-white/5'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[9px] text-slate-500 font-bold self-center mr-1">厂家:</span>
                <button
                  type="button"
                  onClick={() => setSelectedManufacturer(null)}
                  className={`px-2 py-1 text-[9px] font-bold rounded transition-all border ${!selectedManufacturer ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white/5 text-slate-500 border-white/5'}`}
                >
                  全部
                </button>
                {manufacturers.map(mfr => (
                  <button
                    key={mfr}
                    type="button"
                    onClick={() => setSelectedManufacturer(mfr)}
                    className={`px-2 py-1 text-[9px] font-bold rounded transition-all border ${selectedManufacturer === mfr ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white/5 text-slate-500 border-white/5'}`}
                  >
                    {mfr}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {filteredCatalog.map((item: any) => {
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
                    className="px-2 py-1.5 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all"
                  >
                    {mfr} {model} (¥{item.price})
                  </button>
                );
              })}
              {filteredCatalog.length === 0 && (
                <p className="text-[10px] text-slate-600 italic py-2">该分类下暂无预设设备</p>
              )}
            </div>
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
