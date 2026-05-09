import { useState } from 'react';
import { Package, Plus, Trash2, Edit2, Save, X, DollarSign } from 'lucide-react';

interface EquipmentType {
  id: string;
  name: string;
  price: number;
}

export const EquipmentCatalog = ({ catalog, onUpdate, onDelete, onAdd }: { 
  catalog: EquipmentType[], 
  onUpdate: (id: string, name: string, price: number) => void,
  onDelete: (id: string) => void,
  onAdd: (name: string, price: number) => void
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const handleAdd = () => {
    if (!newName || !newPrice) return;
    onAdd(newName, Number(newPrice));
    setNewName('');
    setNewPrice('');
    setIsAdding(false);
  };

  const handleStartEdit = (item: EquipmentType) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    onUpdate(editingId, editName, Number(editPrice));
    setEditingId(null);
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
              <tr className="bg-brand-primary/5 animate-in fade-in duration-300">
                <td className="py-4 px-6">
                  <input 
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="如：50油箱"
                    className="bg-bg-secondary border border-brand-primary/30 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-full"
                  />
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-slate-500 text-sm">¥</span>
                    <input 
                      type="number"
                      value={newPrice}
                      onChange={e => setNewPrice(e.target.value)}
                      placeholder="0.00"
                      className="bg-bg-secondary border border-brand-primary/30 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-24 text-right"
                    />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    <button onClick={handleAdd} className="p-1.5 bg-emerald-500/20 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><Plus size={16} /></button>
                    <button onClick={() => setIsAdding(false)} className="p-1.5 bg-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><X size={16} /></button>
                  </div>
                </td>
              </tr>
            )}

            {catalog.length === 0 && !isAdding && (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-500 italic">
                  暂无设备价格数据，请点击右上角新增。
                </td>
              </tr>
            )}

            {catalog.map(item => (
              <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                <td className="py-4 px-6">
                  {editingId === item.id ? (
                    <input 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="bg-bg-secondary border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-full"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-primary/40" />
                      <span className="text-white font-medium">{item.name}</span>
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-right">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-slate-500 text-sm">¥</span>
                      <input 
                        type="number"
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        className="bg-bg-secondary border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none w-24 text-right"
                      />
                    </div>
                  ) : (
                    <span className="text-emerald-400 font-mono font-bold">¥ {item.price.toLocaleString()}</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === item.id ? (
                      <>
                        <button onClick={handleSaveEdit} className="text-emerald-400 hover:text-emerald-300"><Save size={16} /></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white"><X size={16} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleStartEdit(item)} className="text-slate-400 hover:text-brand-primary"><Edit2 size={16} /></button>
                        <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-rose-400"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-400/5 border border-amber-400/10 rounded-2xl p-4 flex items-start gap-3">
        <DollarSign className="text-amber-400 shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-amber-400/80 leading-relaxed">
          <p className="font-bold mb-1">使用小贴士：</p>
          <p>系统会根据此表中的“名称”在商户的设备描述中进行关键词匹配。例如您设置了“油箱”为300元，只要商户设备里包含“油箱”二字，系统就会自动计入300元资产值。如果有多样设备，请用逗号隔开录入。</p>
        </div>
      </div>
    </div>
  );
};
