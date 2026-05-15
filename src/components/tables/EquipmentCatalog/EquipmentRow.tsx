import { Edit2, Trash2, Check, X } from 'lucide-react';
import { CATEGORIES, STOVE_MANUFACTURERS, EQUIPMENT_MODELS, parseEquipName as parseName } from '../../../config/equipment';
import { StoveSpecForm } from './StoveSpecForm';
import type { EquipmentType, FormattedPresets } from './types';

interface EquipmentRowProps {
  item: EquipmentType;
  editingId: string | null;
  editCategory: string;
  setEditCategory: (v: string) => void;
  editManufacturer: string;
  setEditManufacturer: (v: string) => void;
  customManufacturer: string;
  setCustomManufacturer: (v: string) => void;
  editType: string;
  setEditType: (v: string) => void;
  editCustomType: string;
  setEditCustomType: (v: string) => void;
  editNote: string;
  setEditNote: (v: string) => void;
  editPrice: string;
  setEditPrice: (v: string) => void;
  
  // Specs for editing
  editSpecDim: string; setEditSpecDim: (v: string) => void;
  editCustomSpecDim: string; setEditCustomSpecDim: (v: string) => void;
  editSpecBurner: string; setEditSpecBurner: (v: string) => void;
  editCustomSpecBurner: string; setEditCustomSpecBurner: (v: string) => void;
  editSpecBasin: string; setEditSpecBasin: (v: string) => void;
  editSpecSilent: boolean; setEditSpecSilent: (v: boolean) => void;
  editSpecHandle: boolean; setEditSpecHandle: (v: boolean) => void;
  editSpecFlameout: boolean; setEditSpecFlameout: (v: boolean) => void;
  editDeductTopSpace: boolean; setEditDeductTopSpace: (v: boolean) => void;
  
  formattedPresets: FormattedPresets;
  onStartEdit: (item: EquipmentType) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  isSubmitting: boolean;
  volumeLabel: string | null;
}

export const EquipmentRow = ({
  item, editingId, editCategory, setEditCategory, editManufacturer, setEditManufacturer,
  customManufacturer, setCustomManufacturer, editType, setEditType, editCustomType, setEditCustomType,
  editNote, setEditNote, editPrice, setEditPrice,
  editSpecDim, setEditSpecDim, editCustomSpecDim, setEditCustomSpecDim,
  editSpecBurner, setEditSpecBurner, editCustomSpecBurner, setEditCustomSpecBurner,
  editSpecBasin, setEditSpecBasin, editSpecSilent, setEditSpecSilent,
  editSpecHandle, setEditSpecHandle, editSpecFlameout, setEditSpecFlameout,
  editDeductTopSpace, setEditDeductTopSpace,
  formattedPresets, onStartEdit, onSaveEdit, onCancelEdit, onDelete, isSubmitting, volumeLabel
}: EquipmentRowProps) => {
  const isEditing = editingId === item.id;
  const { category, manufacturer, itemName } = parseName(item.name);

  return (
    <tr className={`group transition-colors border-b border-white/[0.02] ${isEditing ? 'bg-brand-primary/5' : 'hover:bg-white/5'}`}>
      <td className="py-4 px-6">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <select 
                value={editCategory} 
                onChange={e => setEditCategory(e.target.value)}
                className="bg-bg-secondary border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none w-24"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              
              <select 
                value={editManufacturer} 
                onChange={e => setEditManufacturer(e.target.value)}
                className="bg-bg-secondary border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-32"
              >
                <option value="">-- 厂家 --</option>
                {STOVE_MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
                {formattedPresets.manufacturers.map(m => (
                  <option key={m.id} value={m.value}>{m.value} (预设)</option>
                ))}
                <option value="其他厂家">+ 新增厂家...</option>
              </select>
              {editManufacturer === '其他厂家' && (
                <input 
                  value={customManufacturer} onChange={e => setCustomManufacturer(e.target.value)}
                  placeholder="输入厂家" className="bg-bg-secondary border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-24"
                />
              )}

              <select 
                value={editType} onChange={e => setEditType(e.target.value)}
                className="bg-bg-secondary border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-32"
              >
                <option value="">-- 型号 --</option>
                {(EQUIPMENT_MODELS[editCategory] || []).map(t => <option key={t} value={t}>{t}</option>)}
                {formattedPresets.models.filter(m => m.category === editCategory).map(m => (
                  <option key={m.id} value={m.value}>{m.value} (预设)</option>
                ))}
                <option value="其他型号">+ 新增型号...</option>
              </select>
              {editType === '其他型号' && (
                <input 
                  value={editCustomType} onChange={e => setEditCustomType(e.target.value)}
                  placeholder="新型号名称" className="bg-bg-secondary border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-32"
                />
              )}

              <input 
                value={editNote} onChange={e => setEditNote(e.target.value)}
                placeholder="自定义备注 (如: 木包装)"
                className="bg-bg-secondary border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none flex-1"
              />
            </div>

            <StoveSpecForm 
              category={editCategory}
              specDim={editSpecDim} setSpecDim={setEditSpecDim}
              customSpecDim={editCustomSpecDim} setCustomSpecDim={setEditCustomSpecDim}
              specBurner={editSpecBurner} setSpecBurner={setEditSpecBurner}
              customSpecBurner={editCustomSpecBurner} setCustomSpecBurner={setEditCustomSpecBurner}
              specBasin={editSpecBasin} setSpecBasin={setEditSpecBasin}
              specSilent={editSpecSilent} setSpecSilent={setEditSpecSilent}
              specHandle={editSpecHandle} setSpecHandle={setEditSpecHandle}
              specFlameout={editSpecFlameout} setSpecFlameout={setEditSpecFlameout}
              deductTopSpace={editDeductTopSpace} setDeductTopSpace={setEditDeductTopSpace}
              formattedPresets={formattedPresets}
              volumeLabel={volumeLabel}
              isEdit={true}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[10px] font-bold">{category}</span>
              <span className="text-slate-500 text-[10px]">{manufacturer}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-medium text-sm">{itemName}</span>
              {category === '油箱' && volumeLabel && (
                <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold rounded border border-emerald-400/20">
                  预估容积: {volumeLabel}L {itemName.includes('满装') ? '(满装)' : '(扣除顶部)'}
                </span>
              )}
            </div>
          </div>
        )}
      </td>
      <td className="py-4 px-6 text-right">
        {isEditing ? (
          <div className="relative inline-block w-32">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary font-bold text-sm">¥</span>
            <input 
              type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
              className="w-full bg-bg-secondary border border-brand-primary/30 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white outline-none"
            />
          </div>
        ) : (
          <span className="text-brand-primary font-black text-lg">¥{item.price.toLocaleString()}</span>
        )}
      </td>
      <td className="py-4 px-6 text-center">
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <button onClick={onSaveEdit} disabled={isSubmitting} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
              {isSubmitting ? <Check size={14} className="animate-pulse" /> : <Check size={14} />}
            </button>
            <button onClick={onCancelEdit} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 hover:text-white transition-all"><X size={14} /></button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onStartEdit(item)} className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-all"><Edit2 size={14} /></button>
            <button onClick={() => onDelete(item.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /></button>
          </div>
        )}
      </td>
    </tr>
  );
};
