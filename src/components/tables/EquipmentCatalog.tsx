import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit2, X, DollarSign, Loader2, Check } from 'lucide-react';
import { 
  CATEGORIES, 
  STOVE_TYPES, 
  STOVE_DIMENSIONS, 
  STOVE_BURNERS, 
  STOVE_BASINS, 
  STOVE_MANUFACTURERS,
  parseEquipName as parseName 
} from '../../config/equipment';

interface EquipmentType {
  id: string;
  name: string;
  price: number;
}

export const EquipmentCatalog = ({ catalog = [], onUpdate, onDelete, onAdd }: { 
  catalog: EquipmentType[], 
  onUpdate: (id: string, name: string, price: number) => void,
  onDelete: (id: string) => void,
  onAdd: (name: string, price: number) => void
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [customType, setCustomType] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [customManufacturer, setCustomManufacturer] = useState('');
  const [newCategory, setNewCategory] = useState('炉灶');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorField, setErrorField] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState('');
  const [editCustomType, setEditCustomType] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editManufacturer, setEditManufacturer] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // States for NEW equipment specs
  const [newSpecDim, setNewSpecDim] = useState('');
  const [newSpecBurner, setNewSpecBurner] = useState('');
  const [newSpecBasin, setNewSpecBasin] = useState('');
  const [newSpecSilent, setNewSpecSilent] = useState(false);
  const [newSpecHandle, setNewSpecHandle] = useState(false);
  const [newSpecFlameout, setNewSpecFlameout] = useState(false);

  // States for EDITING equipment specs
  const [editSpecDim, setEditSpecDim] = useState('');
  const [editSpecBurner, setEditSpecBurner] = useState('');
  const [editSpecBasin, setEditSpecBasin] = useState('');
  const [editSpecSilent, setEditSpecSilent] = useState(false);
  const [editSpecHandle, setEditSpecHandle] = useState(false);
  const [editSpecFlameout, setEditSpecFlameout] = useState(false);

  const buildFullName = (cat: string, mfr: string, type: string, note: string, dim: string, burner: string, basin: string, silent: boolean, handle: boolean, flameout: boolean) => {
    let details = [];
    if (type === '其他型号') {
      if (note) details.push(note);
    } else {
      if (type) details.push(type);
      if (note) details.push(note);
    }
    if (dim) details.push(dim);
    if (burner && burner !== '常规') details.push(burner + '头');
    if (basin) details.push(basin + (basin.includes('#') ? '' : '盆'));
    if (silent) details.push('静音');
    if (handle) details.push('手柄开关');
    if (flameout) details.push('拉锅熄火');
    
    const itemName = details.length > 0 ? details.join('/') : '常规型号';
    return `${cat}::${mfr}::${itemName}`;
  };

  const parseItemNameSpecs = (itemName: string) => {
    const specs = itemName.split('/');
    let dim = '', burner = '', basin = '', silent = false, handle = false, flameout = false, type = '', note = '';
    
    specs.forEach(s => {
      if (STOVE_DIMENSIONS.includes(s)) dim = s;
      else if (s.endsWith('头')) burner = s.replace('头', '');
      else if (s.endsWith('盆') || s.includes('#')) basin = s.replace('盆', '');
      else if (s === '静音') silent = true;
      else if (s === '手柄开关') handle = true;
      else if (s === '拉杆熄火' || s === '拉锅熄火') flameout = true;
      else if (STOVE_TYPES.includes(s)) type = s;
      else if (!type) type = s;
      else if (!note) note = s;
    });
    
    return { dim, burner, basin, silent, handle, flameout, type, note };
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
      const fullName = buildFullName(newCategory, finalMfr, finalType, customNote, newSpecDim, newSpecBurner, newSpecBasin, newSpecSilent, newSpecHandle, newSpecFlameout);
      await onAdd(fullName, Number(newPrice));
      
      setSelectedType('');
      setCustomType('');
      setCustomNote('');
      setNewPrice('');
      setNewManufacturer('');
      setCustomManufacturer('');
      setNewSpecDim('');
      setNewSpecBurner('');
      setNewSpecBasin('');
      setNewSpecSilent(false);
      setNewSpecHandle(false);
      setNewSpecFlameout(false);
      setIsAdding(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (item: EquipmentType) => {
    const { category, manufacturer, itemName } = parseName(item.name);
    const specs = parseItemNameSpecs(itemName);
    
    setEditingId(item.id);
    setEditCategory(category);
    setEditManufacturer(manufacturer);
    setEditPrice(item.price.toString());
    
    setEditSpecDim(specs.dim);
    setEditSpecBurner(specs.burner);
    setEditSpecBasin(specs.basin);
    setEditSpecSilent(specs.silent);
    setEditSpecHandle(specs.handle);
    setEditSpecFlameout(specs.flameout);
    
    // Check if the type is standard or custom
    if (STOVE_TYPES.includes(specs.type)) {
      setEditType(specs.type);
      setEditCustomType('');
    } else {
      setEditType('其他型号');
      setEditCustomType(specs.type);
    }
    setEditNote(specs.note);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const finalMfr = editManufacturer === '其他厂家' ? customManufacturer : editManufacturer;
    setIsSubmitting(true);
    try {
      const finalType = editType === '其他型号' ? editCustomType : editType;
      const fullName = buildFullName(editCategory, finalMfr, finalType, editNote, editSpecDim, editSpecBurner, editSpecBasin, editSpecSilent, editSpecHandle, editSpecFlameout);
      await onUpdate(editingId, fullName, Number(editPrice));
      setEditingId(null);
      setEditCustomType('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
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
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} /> 新增设备型号
        </button>
      </header>

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
            {isAdding && (
              <tr className="bg-brand-primary/5 animate-in fade-in duration-300 border-b border-brand-primary/20">
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <select 
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="bg-bg-secondary border border-brand-primary/30 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none w-24"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select 
                      value={selectedType}
                      onChange={e => setSelectedType(e.target.value)}
                      className="bg-bg-secondary border border-brand-primary/30 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-32"
                    >
                      <option value="">-- 选择型号 --</option>
                      {STOVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {selectedType === '其他型号' && (
                      <input 
                        value={customType}
                        onChange={e => setCustomType(e.target.value)}
                        placeholder="新型号名称*"
                        className="bg-bg-secondary border border-brand-primary/30 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-32 animate-in fade-in zoom-in-95 duration-200"
                      />
                    )}
                    <select 
                      value={newManufacturer}
                      onChange={e => setNewManufacturer(e.target.value)}
                      className={`bg-bg-secondary border ${errorField === 'mfr' ? 'border-rose-500 animate-pulse' : 'border-brand-primary/30'} rounded-lg px-3 py-1.5 text-sm text-white outline-none w-32`}
                    >
                      <option value="">-- 厂家* --</option>
                      {STOVE_MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    {newManufacturer === '其他厂家' && (
                      <input 
                        value={customManufacturer}
                        onChange={e => setCustomManufacturer(e.target.value)}
                        placeholder="新厂家名称*"
                        className={`bg-bg-secondary border ${errorField === 'mfr' ? 'border-rose-500 animate-pulse' : 'border-white/10'} rounded-lg px-3 py-1.5 text-sm text-white outline-none w-28 animate-in fade-in zoom-in-95 duration-200`}
                      />
                    )}
                    <input 
                      value={customNote}
                      onChange={e => setCustomNote(e.target.value)}
                      placeholder="型号备注 (如: 木包装)"
                      className="bg-bg-secondary border border-brand-primary/30 rounded-lg px-3 py-1.5 text-sm text-white outline-none flex-1"
                    />
                  </div>
                  {newCategory === '炉灶' && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 animate-in slide-in-from-top-1 duration-300">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-black uppercase">尺寸:</span>
                        <select 
                          value={newSpecDim}
                          onChange={e => setNewSpecDim(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none"
                        >
                          <option value="">-</option>
                          {STOVE_DIMENSIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-black uppercase">炉头:</span>
                        <select 
                          value={newSpecBurner}
                          onChange={e => setNewSpecBurner(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none"
                        >
                          <option value="">-</option>
                          {STOVE_BURNERS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-black uppercase">盆口:</span>
                        <select 
                          value={newSpecBasin}
                          onChange={e => setNewSpecBasin(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none"
                        >
                          <option value="">-</option>
                          {STOVE_BASINS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-4 ml-2">
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input type="checkbox" checked={newSpecSilent} onChange={e => setNewSpecSilent(e.target.checked)} className="hidden" />
                          <div className={`w-3.5 h-3.5 rounded border ${newSpecSilent ? 'bg-brand-primary border-brand-primary' : 'border-white/20'} flex items-center justify-center transition-all`}>
                            {newSpecSilent && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold group-hover:text-white transition-colors">静音</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input type="checkbox" checked={newSpecHandle} onChange={e => setNewSpecHandle(e.target.checked)} className="hidden" />
                          <div className={`w-3.5 h-3.5 rounded border ${newSpecHandle ? 'bg-brand-primary border-brand-primary' : 'border-white/20'} flex items-center justify-center transition-all`}>
                            {newSpecHandle && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold group-hover:text-white transition-colors">手柄开关</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input type="checkbox" checked={newSpecFlameout} onChange={e => setNewSpecFlameout(e.target.checked)} className="hidden" />
                          <div className={`w-3.5 h-3.5 rounded border ${newSpecFlameout ? 'bg-brand-primary border-brand-primary' : 'border-white/20'} flex items-center justify-center transition-all`}>
                            {newSpecFlameout && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold group-hover:text-white transition-colors">拉锅熄火</span>
                        </label>
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary font-bold text-sm">¥</span>
                    <input 
                      type="number"
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value)}
                      placeholder="报价*"
                      className={`w-32 bg-bg-secondary border ${errorField === 'price' ? 'border-rose-500 animate-pulse' : 'border-brand-primary/30'} rounded-lg pl-8 pr-4 py-1.5 text-sm text-white outline-none font-bold`}
                    />
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={handleAdd} 
                      disabled={isSubmitting}
                      className="p-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    </button>
                    <button onClick={() => setIsAdding(false)} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-colors"><X size={18} /></button>
                  </div>
                </td>
              </tr>
            )}

            {CATEGORIES.map(category => {
              const categoryItems = catalog.filter(item => parseName(item.name).category === category);
              if (categoryItems.length === 0 && !isAdding) return null;
              if (categoryItems.length === 0 && isAdding && newCategory !== category) return null;

              const manufacturers = Array.from(new Set(categoryItems.map(item => parseName(item.name).manufacturer)));

              return (
                <React.Fragment key={category}>
                  {categoryItems.length > 0 && (
                    <tr className="bg-white/5">
                      <td colSpan={3} className="py-2 px-6 text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/5">
                        {category}
                      </td>
                    </tr>
                  )}
                  {manufacturers.map(mfr => {
                    const mfrItems = categoryItems.filter(item => parseName(item.name).manufacturer === mfr);
                    return (
                      <React.Fragment key={mfr}>
                        {mfrItems.map((item) => {
                          const { itemName } = parseName(item.name);
                          return (
                            <tr key={item.id} className="group hover:bg-white/5 transition-colors border-b border-white/[0.02]">
                              <td className="py-4 px-6">
                                {editingId === item.id ? (
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
                                        {STOVE_MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
                                      </select>
                                      {editManufacturer === '其他厂家' && (
                                        <input 
                                          value={customManufacturer}
                                          onChange={e => setCustomManufacturer(e.target.value)}
                                          placeholder="输入厂家"
                                          className="bg-bg-secondary border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-24"
                                        />
                                      )}
                                      <select 
                                        value={editType}
                                        onChange={e => setEditType(e.target.value)}
                                        className="bg-bg-secondary border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-32"
                                      >
                                        <option value="">-- 型号 --</option>
                                        {STOVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                      </select>
                                      {editType === '其他型号' && (
                                        <input 
                                          value={editCustomType}
                                          onChange={e => setEditCustomType(e.target.value)}
                                          placeholder="新型号名称"
                                          className="bg-bg-secondary border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-32"
                                        />
                                      )}
                                      <input 
                                        value={editNote}
                                        onChange={e => setEditNote(e.target.value)}
                                        placeholder="自定义备注 (如: 木包装)"
                                        className="bg-bg-secondary border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none flex-1"
                                      />
                                    </div>
                                    
                                    {editCategory === '炉灶' && (
                                      <div className="flex flex-wrap items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] text-slate-500 font-black uppercase">尺寸:</span>
                                          <select value={editSpecDim} onChange={e => setEditSpecDim(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none">
                                            <option value="">-</option>
                                            {STOVE_DIMENSIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                          </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] text-slate-500 font-black uppercase">炉头:</span>
                                          <select value={editSpecBurner} onChange={e => setEditSpecBurner(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none">
                                            <option value="">-</option>
                                            {STOVE_BURNERS.map(b => <option key={b} value={b}>{b}</option>)}
                                          </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] text-slate-500 font-black uppercase">盆口:</span>
                                          <select value={editSpecBasin} onChange={e => setEditSpecBasin(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white outline-none">
                                            <option value="">-</option>
                                            {STOVE_BASINS.map(b => <option key={b} value={b}>{b}</option>)}
                                          </select>
                                        </div>
                                        <div className="flex items-center gap-4 ml-2">
                                          <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input type="checkbox" checked={editSpecSilent} onChange={e => setEditSpecSilent(e.target.checked)} className="hidden" />
                                            <div className={`w-3.5 h-3.5 rounded border ${editSpecSilent ? 'bg-brand-primary border-brand-primary' : 'border-white/20'} flex items-center justify-center transition-all`}>
                                              {editSpecSilent && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold group-hover:text-white transition-colors">静音</span>
                                          </label>
                                          <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input type="checkbox" checked={editSpecHandle} onChange={e => setEditSpecHandle(e.target.checked)} className="hidden" />
                                            <div className={`w-3.5 h-3.5 rounded border ${editSpecHandle ? 'bg-brand-primary border-brand-primary' : 'border-white/20'} flex items-center justify-center transition-all`}>
                                              {editSpecHandle && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold group-hover:text-white transition-colors">手柄开关</span>
                                          </label>
                                          <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input type="checkbox" checked={editSpecFlameout} onChange={e => setEditSpecFlameout(e.target.checked)} className="hidden" />
                                            <div className={`w-3.5 h-3.5 rounded border ${editSpecFlameout ? 'bg-brand-primary border-brand-primary' : 'border-white/20'} flex items-center justify-center transition-all`}>
                                              {editSpecFlameout && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold group-hover:text-white transition-colors">拉锅熄火</span>
                                          </label>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 pl-4">
                                    <div className="p-2 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                                      <Package size={16} className="text-brand-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-black rounded border border-brand-primary/20 uppercase tracking-widest">
                                          {parseName(item.name).manufacturer}
                                        </span>
                                        <span className="text-white font-bold tracking-tight text-sm">
                                          {itemName}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-6 text-right">
                                {editingId === item.id ? (
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary font-bold text-sm">¥</span>
                                    <input 
                                      type="number"
                                      value={editPrice}
                                      onChange={e => setEditPrice(e.target.value)}
                                      className="w-28 bg-bg-secondary border border-brand-primary/30 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white outline-none font-bold"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-emerald-400 font-black text-base">
                                    ¥ {item.price.toLocaleString()}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-right">
                                {editingId === item.id ? (
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={handleSaveEdit} 
                                      disabled={isSubmitting}
                                      className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                    >
                                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="p-2 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-colors"><X size={16} /></button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    <button onClick={() => handleStartEdit(item)} className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-all"><Edit2 size={14} /></button>
                                    <button onClick={() => onDelete(item.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-400/5 border border-amber-400/10 rounded-2xl p-4 flex items-start gap-3">
        <DollarSign className="text-amber-400 shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-amber-400/80 leading-relaxed">
          <p className="font-bold mb-1">使用小贴士：</p>
          <p>您可以先选择分类（如：炉灶），然后在名称中填入具体厂家或型号（如：厂家A单灶）。系统会自动计算资产值。如果有多样设备，请在商户记录中用逗号隔开录入（如：厂家A单灶, 50油箱）。</p>
        </div>
      </div>
    </div>
  );
};
