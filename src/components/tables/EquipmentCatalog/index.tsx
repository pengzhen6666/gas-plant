import { useState, Fragment } from 'react';
import { Package, Plus, DollarSign, Settings2 } from 'lucide-react';
import { 
  CATEGORIES, 
  STOVE_DIMENSIONS, 
  STOVE_BURNERS, 
  ALL_MODELS, 
  parseEquipName as parseName 
} from '../../../config/equipment';
import { calculateTankVolume } from '../../../utils/index';

// Sub-components
import type { EquipmentType, FormattedPresets, PresetType } from './types';
import { PresetsManager } from './PresetsManager';
import { AddEquipmentRow } from './AddEquipmentRow';
import { EquipmentRow } from './EquipmentRow';

export const EquipmentCatalog = ({ 
  catalog = [], presets = [], onUpdate, onDelete, onAdd, onAddPreset, onDeletePreset 
}: { 
  catalog: EquipmentType[], 
  presets: PresetType[],
  onUpdate: (id: string, name: string, price: number) => void,
  onDelete: (id: string) => void,
  onAdd: (name: string, price: number) => void,
  onAddPreset: (type: string, value: string, category?: string) => void,
  onDeletePreset: (id: string) => void
}) => {
  // UI States
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingOptions, setIsManagingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorField, setErrorField] = useState<string | null>(null);

  // ADD states
  const [newCategory, setNewCategory] = useState('炉灶');
  const [selectedType, setSelectedType] = useState('');
  const [customType, setCustomType] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [customManufacturer, setCustomManufacturer] = useState('');
  const [newSpecDim, setNewSpecDim] = useState('');
  const [newSpecBurner, setNewSpecBurner] = useState('');
  const [newSpecBasin, setNewSpecBasin] = useState('');
  const [newSpecSilent, setNewSpecSilent] = useState(false);
  const [newSpecHandle, setNewSpecHandle] = useState(false);
  const [newSpecFlameout, setNewSpecFlameout] = useState(false);
  const [customSpecDim, setCustomSpecDim] = useState('');
  const [customSpecBurner, setCustomSpecBurner] = useState('');
  const [newDeductTopSpace, setNewDeductTopSpace] = useState(true);

  // EDIT states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editManufacturer, setEditManufacturer] = useState('');
  const [editType, setEditType] = useState('');
  const [editCustomType, setEditCustomType] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editSpecDim, setEditSpecDim] = useState('');
  const [editSpecBurner, setEditSpecBurner] = useState('');
  const [editSpecBasin, setEditSpecBasin] = useState('');
  const [editSpecSilent, setEditSpecSilent] = useState(false);
  const [editSpecHandle, setEditSpecHandle] = useState(false);
  const [editSpecFlameout, setEditSpecFlameout] = useState(false);
  const [editCustomSpecDim, setEditCustomSpecDim] = useState('');
  const [editCustomSpecBurner, setEditCustomSpecBurner] = useState('');
  const [editDeductTopSpace, setEditDeductTopSpace] = useState(true);

  // Helper to format presets from DB structure
  const formattedPresets: FormattedPresets = {
    models: presets.filter(p => p.type === 'model').map(p => ({ category: p.category || '', value: p.value, id: p.id })),
    manufacturers: presets.filter(p => p.type === 'manufacturer').map(p => ({ value: p.value, id: p.id })),
    dimensions: presets.filter(p => p.type === 'dimension').map(p => ({ value: p.value, id: p.id })),
    burners: presets.filter(p => p.type === 'burner').map(p => ({ value: p.value, id: p.id }))
  };

  const buildFullName = (cat: string, mfr: string, type: string, note: string, dim: string, burner: string, basin: string, silent: boolean, handle: boolean, flameout: boolean, deductTopSpace: boolean, cDim?: string, cBurner?: string) => {
    let details: string[] = [];
    
    const finalDim = (dim === '其他尺寸' && cDim) ? cDim : dim;
    const finalType = type === '其他型号' ? '' : type;

    // Add type if it's not empty and not identical to dimensions
    if (finalType && finalType !== finalDim) {
      details.push(finalType);
    }
    
    if (note) details.push(note);
    
    if (finalDim) {
      details.push(finalDim);
    }

    if (burner && burner !== '常规') {
      const bValue = (burner === '其他炉头' && cBurner) ? cBurner : burner;
      details.push(bValue + (bValue.endsWith('眼') || bValue.endsWith('头') ? '' : '头'));
    }
    if (basin) details.push(basin + (basin.includes('#') ? '' : '盆'));
    if (silent) details.push('静音');
    if (handle) details.push('手柄开关');
    if (flameout) details.push('拉锅熄火');
    
    // For oil tanks, specify if it's full capacity
    if (cat === '油箱' && !deductTopSpace) details.push('满装');
    
    const itemName = details.length > 0 ? details.join('/') : '常规型号';
    return `${cat}:${mfr}:${itemName}`;
  };

  const parseItemNameSpecs = (itemName: string) => {
    const specs = itemName.split('/');
    let dim = '', burner = '', basin = '', silent = false, handle = false, flameout = false, type = '', note = '', deductTopSpace = true;
    
    const customDims = formattedPresets.dimensions.map(d => d.value);
    const customBurners = formattedPresets.burners.map(b => b.value);
    const customModels = formattedPresets.models.map(m => m.value);

    specs.forEach(s => {
      const trimmed = s.trim();
      if (STOVE_DIMENSIONS.includes(trimmed) || customDims.includes(trimmed) || /^\d+\*\d+\*\d+$/.test(trimmed.replace(/\s+/g, ''))) dim = trimmed;
      else if (s.endsWith('头') || s.endsWith('眼') || customBurners.includes(s)) burner = s.replace(/[头眼]$/, '');
      else if (s.endsWith('盆') || s.includes('#')) basin = s.replace('盆', '');
      else if (s === '静音') silent = true;
      else if (s === '手柄开关') handle = true;
      else if (s === '拉杆熄火' || s === '拉锅熄火') flameout = true;
      else if (s === '满装') deductTopSpace = false;
      else if (ALL_MODELS.includes(s) || customModels.includes(s)) type = s;
      else if (!type) type = s;
      else if (!note) note = s;
    });
    
    return { dim, burner, basin, silent, handle, flameout, type, note, deductTopSpace };
  };

  const handleAdd = async () => {
    setErrorField(null);
    if (!newPrice) { setErrorField('price'); return; }
    if (!newManufacturer) { setErrorField('mfr'); return; }
    const finalMfr = newManufacturer === '其他厂家' ? customManufacturer : newManufacturer;
    if (!finalMfr) { setErrorField('mfr'); return; }
    
    setIsSubmitting(true);
    try {
      const finalType = selectedType === '其他型号' ? customType : selectedType;
      const fullName = buildFullName(newCategory, finalMfr, finalType, customNote, newSpecDim, newSpecBurner, newSpecBasin, newSpecSilent, newSpecHandle, newSpecFlameout, newDeductTopSpace, customSpecDim, customSpecBurner);
      
      if (selectedType === '其他型号' && customType) onAddPreset('model', customType, newCategory);
      if (newManufacturer === '其他厂家' && customManufacturer) onAddPreset('manufacturer', customManufacturer);
      if (newSpecDim === '其他尺寸' && customSpecDim) onAddPreset('dimension', customSpecDim);
      if (newSpecBurner === '其他炉头' && customSpecBurner) onAddPreset('burner', customSpecBurner);

      await onAdd(fullName, Number(newPrice));
      
      setSelectedType(''); setCustomType(''); setCustomNote(''); setNewPrice(''); setNewManufacturer('');
      setCustomManufacturer(''); setNewSpecDim(''); setNewSpecBurner(''); setCustomSpecDim('');
      setCustomSpecBurner(''); setNewSpecBasin(''); setNewSpecSilent(false); setNewSpecHandle(false);
      setNewSpecFlameout(false); setNewDeductTopSpace(true); setIsAdding(false);
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  const handleStartEdit = (item: EquipmentType) => {
    const { category, manufacturer, itemName } = parseName(item.name);
    const specs = parseItemNameSpecs(itemName);
    
    setEditingId(item.id);
    setEditCategory(category);
    setEditManufacturer(manufacturer);
    setEditPrice(item.price.toString());
    
    const customDims = formattedPresets.dimensions.map(d => d.value);
    const customBurners = formattedPresets.burners.map(b => b.value);

    if (STOVE_DIMENSIONS.includes(specs.dim) || customDims.includes(specs.dim)) {
      setEditSpecDim(specs.dim); setEditCustomSpecDim('');
    } else if (specs.dim) {
      setEditSpecDim('其他尺寸'); setEditCustomSpecDim(specs.dim);
    } else {
      setEditSpecDim(''); setEditCustomSpecDim('');
    }

    if (STOVE_BURNERS.includes(specs.burner) || customBurners.includes(specs.burner)) {
      setEditSpecBurner(specs.burner); setEditCustomSpecBurner('');
    } else if (specs.burner) {
      setEditSpecBurner('其他炉头'); setEditCustomSpecBurner(specs.burner);
    } else {
      setEditSpecBurner(''); setEditCustomSpecBurner('');
    }
    
    setEditSpecBasin(specs.basin); setEditSpecSilent(specs.silent);
    setEditSpecHandle(specs.handle); setEditSpecFlameout(specs.flameout);
    setEditDeductTopSpace(specs.deductTopSpace);
    
    if (ALL_MODELS.includes(specs.type)) {
      setEditType(specs.type); setEditCustomType('');
    } else {
      setEditType('其他型号'); setEditCustomType(specs.type);
    }
    setEditNote(specs.note);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const finalMfr = editManufacturer === '其他厂家' ? customManufacturer : editManufacturer;
    setIsSubmitting(true);
    try {
      const finalType = editType === '其他型号' ? editCustomType : editType;
      const fullName = buildFullName(editCategory, finalMfr, finalType, editNote, editSpecDim, editSpecBurner, editSpecBasin, editSpecSilent, editSpecHandle, editSpecFlameout, editDeductTopSpace, editCustomSpecDim, editCustomSpecBurner);
      
      if (editType === '其他型号' && editCustomType) onAddPreset('model', editCustomType, editCategory);
      if (editManufacturer === '其他厂家' && customManufacturer) onAddPreset('manufacturer', customManufacturer);
      if (editSpecDim === '其他尺寸' && editCustomSpecDim) onAddPreset('dimension', editCustomSpecDim);
      if (editSpecBurner === '其他炉头' && editCustomSpecBurner) onAddPreset('burner', editCustomSpecBurner);

      await onUpdate(editingId, fullName, Number(editPrice));
      setEditingId(null); setEditCustomType(''); setEditCustomSpecDim(''); setEditCustomSpecBurner(''); setEditDeductTopSpace(true);
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center text-white">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="text-brand-primary" size={32} />
            设备资产价值库
          </h1>
          <p className="text-slate-400 text-sm mt-1">设置常用设备的参考单价，用于自动估算商户资产。</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsManagingOptions(!isManagingOptions)}
            className={`p-2 rounded-xl border transition-all ${isManagingOptions ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
            title="管理自定义预设"
          >
            <Settings2 size={20} />
          </button>
          <button onClick={() => setIsAdding(true)} className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2">
            <Plus size={18} /> 新增设备型号
          </button>
        </div>
      </header>

      <PresetsManager 
        isOpen={isManagingOptions} 
        onClose={() => setIsManagingOptions(false)}
        formattedPresets={formattedPresets}
        onDeletePreset={onDeletePreset}
      />

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
              <th className="py-4 px-6 font-bold">设备名称 / 关键词</th>
              <th className="py-4 px-6 font-bold text-right">参考估值 (单价)</th>
              <th className="py-4 px-6 font-bold text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AddEquipmentRow 
              isAdding={isAdding} 
              newCategory={newCategory} setNewCategory={setNewCategory}
              selectedType={selectedType} setSelectedType={setSelectedType}
              customType={customType} setCustomType={setCustomType}
              newManufacturer={newManufacturer} setNewManufacturer={setNewManufacturer}
              customManufacturer={customManufacturer} setCustomManufacturer={setCustomManufacturer}
              customNote={customNote} setCustomNote={setCustomNote}
              newPrice={newPrice} setNewPrice={setNewPrice}
              newSpecDim={newSpecDim} setNewSpecDim={setNewSpecDim}
              customSpecDim={customSpecDim} setCustomSpecDim={setCustomSpecDim}
              newSpecBurner={newSpecBurner} setNewSpecBurner={setNewSpecBurner}
              customSpecBurner={customSpecBurner} setCustomSpecBurner={setCustomSpecBurner}
              newSpecBasin={newSpecBasin} setNewSpecBasin={setNewSpecBasin}
              newSpecSilent={newSpecSilent} setNewSpecSilent={setNewSpecSilent}
              newSpecHandle={newSpecHandle} setNewSpecHandle={setNewSpecHandle}
              newSpecFlameout={newSpecFlameout} setNewSpecFlameout={setNewSpecFlameout}
              errorField={errorField} isSubmitting={isSubmitting}
              formattedPresets={formattedPresets}
              volumeLabel={calculateTankVolume(newSpecDim === '其他尺寸' ? customSpecDim : newSpecDim, newDeductTopSpace)?.toString() || null}
              deductTopSpace={newDeductTopSpace} setDeductTopSpace={setNewDeductTopSpace}
              onAdd={handleAdd} onCancel={() => setIsAdding(false)}
            />

            {CATEGORIES.map(category => {
              const categoryItems = catalog.filter(item => parseName(item.name).category === category);
              if (categoryItems.length === 0) return null;
              
              const manufacturers = Array.from(new Set(categoryItems.map(item => parseName(item.name).manufacturer))).sort();
              
              return (
                <Fragment key={category}>
                  <tr className="bg-white/5">
                    <td colSpan={3} className="py-2 px-6">
                      <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{category}</span>
                    </td>
                  </tr>
                  {manufacturers.map(mfr => {
                    const mfrItems = categoryItems.filter(item => parseName(item.name).manufacturer === mfr);
                    return (
                      <Fragment key={mfr}>
                        {mfrItems.map((item) => {
                          const isEditing = editingId === item.id;
                          const { itemName } = parseName(item.name);
                          const currentSpecs = isEditing 
                            ? { dim: editSpecDim === '其他尺寸' ? editCustomSpecDim : editSpecDim, deduct: editDeductTopSpace }
                            : parseItemNameSpecs(itemName);
                          
                          const vLabel = calculateTankVolume(
                            currentSpecs.dim, 
                            isEditing ? (currentSpecs as any).deduct : (currentSpecs as any).deductTopSpace
                          )?.toString() || null;

                          return (
                            <EquipmentRow 
                              key={item.id} item={item} editingId={editingId}
                              editCategory={editCategory} setEditCategory={setEditCategory}
                              editManufacturer={editManufacturer} setEditManufacturer={setEditManufacturer}
                              customManufacturer={customManufacturer} setCustomManufacturer={setCustomManufacturer}
                              editType={editType} setEditType={setEditType}
                              editCustomType={editCustomType} setEditCustomType={setEditCustomType}
                              editNote={editNote} setEditNote={setEditNote}
                              editPrice={editPrice} setEditPrice={setEditPrice}
                              editSpecDim={editSpecDim} setEditSpecDim={setEditSpecDim}
                              editCustomSpecDim={editCustomSpecDim} setEditCustomSpecDim={setEditCustomSpecDim}
                              editSpecBurner={editSpecBurner} setEditSpecBurner={setEditSpecBurner}
                              editCustomSpecBurner={editCustomSpecBurner} setEditCustomSpecBurner={setEditCustomSpecBurner}
                              editSpecBasin={editSpecBasin} setEditSpecBasin={setEditSpecBasin}
                              editSpecSilent={editSpecSilent} setEditSpecSilent={setEditSpecSilent}
                              editSpecHandle={editSpecHandle} setEditSpecHandle={setEditSpecHandle}
                              editSpecFlameout={editSpecFlameout} setEditSpecFlameout={setEditSpecFlameout}
                              editDeductTopSpace={editDeductTopSpace} setEditDeductTopSpace={setEditDeductTopSpace}
                              formattedPresets={formattedPresets}
                              onStartEdit={handleStartEdit} onSaveEdit={handleSaveEdit}
                              onCancelEdit={() => setEditingId(null)} onDelete={onDelete}
                              isSubmitting={isSubmitting}
                              volumeLabel={vLabel}
                            />
                          );
                        })}
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-400/5 border border-amber-400/10 rounded-2xl p-4 flex items-start gap-3">
        <DollarSign className="text-amber-400 shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-amber-400/80 leading-relaxed">
          <p className="font-bold mb-1">使用小贴士：</p>
          <p>您可以先选择分类（如：炉灶），然后在名称中填入具体厂家或型号。系统会自动计算资产值。如果有多样设备，请在商户记录中用逗号隔开录入。</p>
        </div>
      </div>
    </div>
  );
};
