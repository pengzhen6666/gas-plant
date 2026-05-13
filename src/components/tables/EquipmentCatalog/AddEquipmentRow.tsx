import { Plus, Check, X } from 'lucide-react';
import { CATEGORIES, EQUIPMENT_MODELS, STOVE_MANUFACTURERS } from '../../../config/equipment';
import { StoveSpecForm } from './StoveSpecForm';
import type { FormattedPresets } from './types';

interface AddEquipmentRowProps {
  isAdding: boolean;
  newCategory: string; setNewCategory: (v: string) => void;
  selectedType: string; setSelectedType: (v: string) => void;
  customType: string; setCustomType: (v: string) => void;
  newManufacturer: string; setNewManufacturer: (v: string) => void;
  customManufacturer: string; setCustomManufacturer: (v: string) => void;
  customNote: string; setCustomNote: (v: string) => void;
  newPrice: string; setNewPrice: (v: string) => void;
  
  // Specs
  newSpecDim: string; setNewSpecDim: (v: string) => void;
  customSpecDim: string; setCustomSpecDim: (v: string) => void;
  newSpecBurner: string; setNewSpecBurner: (v: string) => void;
  customSpecBurner: string; setCustomSpecBurner: (v: string) => void;
  newSpecBasin: string; setNewSpecBasin: (v: string) => void;
  newSpecSilent: boolean; setNewSpecSilent: (v: boolean) => void;
  newSpecHandle: boolean; setNewSpecHandle: (v: boolean) => void;
  newSpecFlameout: boolean; setNewSpecFlameout: (v: boolean) => void;
  
  errorField: string | null;
  isSubmitting: boolean;
  formattedPresets: FormattedPresets;
  volumeLabel: string | null;
  onAdd: () => void;
  onCancel: () => void;
}

export const AddEquipmentRow = ({
  isAdding, newCategory, setNewCategory, selectedType, setSelectedType, customType, setCustomType,
  newManufacturer, setNewManufacturer, customManufacturer, setCustomManufacturer, customNote, setCustomNote,
  newPrice, setNewPrice, newSpecDim, setNewSpecDim, customSpecDim, setCustomSpecDim,
  newSpecBurner, setNewSpecBurner, customSpecBurner, setCustomSpecBurner,
  newSpecBasin, setNewSpecBasin, newSpecSilent, setNewSpecSilent,
  newSpecHandle, setNewSpecHandle, newSpecFlameout, setNewSpecFlameout,
  errorField, isSubmitting, formattedPresets, volumeLabel, onAdd, onCancel
}: AddEquipmentRowProps) => {
  if (!isAdding) return null;

  return (
    <tr className="bg-brand-primary/5 animate-in fade-in duration-300 border-b border-brand-primary/20">
      <td className="py-4 px-6">
        <div className="flex gap-2">
          <select 
            value={newCategory} onChange={e => setNewCategory(e.target.value)}
            className="bg-bg-secondary border border-brand-primary/30 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none w-24"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={selectedType} onChange={e => setSelectedType(e.target.value)}
            className="bg-bg-secondary border border-brand-primary/30 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-32"
          >
            <option value="">-- 选择型号 --</option>
            {(EQUIPMENT_MODELS[newCategory] || []).map(t => <option key={t} value={t}>{t}</option>)}
            {formattedPresets.models.filter(m => m.category === newCategory).map(m => (
              <option key={m.id} value={m.value}>{m.value} (预设)</option>
            ))}
            <option value="其他型号">+ 新增型号...</option>
          </select>
          {selectedType === '其他型号' && (
            <input 
              value={customType} onChange={e => setCustomType(e.target.value)}
              placeholder="新型号名称*"
              className="bg-bg-secondary border border-brand-primary/30 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-32 animate-in fade-in zoom-in-95 duration-200"
            />
          )}
          <select 
            value={newManufacturer} onChange={e => setNewManufacturer(e.target.value)}
            className={`bg-bg-secondary border ${errorField === 'mfr' ? 'border-rose-500 animate-pulse' : 'border-brand-primary/30'} rounded-lg px-3 py-1.5 text-sm text-white outline-none w-32`}
          >
            <option value="">-- 厂家* --</option>
            {STOVE_MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
            {formattedPresets.manufacturers.map(m => (
              <option key={m.id} value={m.value}>{m.value} (预设)</option>
            ))}
            <option value="其他厂家">+ 新增厂家...</option>
          </select>
          {newManufacturer === '其他厂家' && (
            <input 
              value={customManufacturer} onChange={e => setCustomManufacturer(e.target.value)}
              placeholder="新厂家名称*"
              className={`bg-bg-secondary border ${errorField === 'mfr' ? 'border-rose-500 animate-pulse' : 'border-white/10'} rounded-lg px-3 py-1.5 text-sm text-white outline-none w-28 animate-in fade-in zoom-in-95 duration-200`}
            />
          )}
          <input 
            value={customNote} onChange={e => setCustomNote(e.target.value)}
            placeholder="型号备注 (如: 木包装)"
            className="bg-bg-secondary border border-brand-primary/50 rounded-lg px-3 py-1.5 text-sm text-white outline-none flex-1 hover:border-brand-primary/80 focus:border-brand-primary transition-colors"
          />
        </div>
        
        <StoveSpecForm 
          category={newCategory}
          specDim={newSpecDim} setSpecDim={setNewSpecDim}
          customSpecDim={customSpecDim} setCustomSpecDim={setCustomSpecDim}
          specBurner={newSpecBurner} setSpecBurner={setNewSpecBurner}
          customSpecBurner={customSpecBurner} setCustomSpecBurner={setCustomSpecBurner}
          specBasin={newSpecBasin} setSpecBasin={setNewSpecBasin}
          specSilent={newSpecSilent} setSpecSilent={setNewSpecSilent}
          specHandle={newSpecHandle} setSpecHandle={setNewSpecHandle}
          specFlameout={newSpecFlameout} setSpecFlameout={setNewSpecFlameout}
          formattedPresets={formattedPresets}
          volumeLabel={volumeLabel}
        />
      </td>
      <td className="py-4 px-6 text-right">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary font-bold text-sm">¥</span>
          <input 
            type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)}
            placeholder="价格*"
            className={`w-full bg-bg-secondary border ${errorField === 'price' ? 'border-rose-500 animate-pulse' : 'border-brand-primary/30'} rounded-lg pl-8 pr-3 py-1.5 text-sm text-white outline-none focus:border-brand-primary transition-colors`}
          />
        </div>
      </td>
      <td className="py-4 px-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <button onClick={onAdd} disabled={isSubmitting} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
            {isSubmitting ? <Check size={18} className="animate-pulse" /> : <Plus size={18} />}
          </button>
          <button onClick={onCancel} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 hover:text-white transition-all"><X size={18} /></button>
        </div>
      </td>
    </tr>
  );
};
