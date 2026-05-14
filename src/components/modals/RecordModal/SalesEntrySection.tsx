import React from 'react';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  equipmentCatalog: any[];
  filterMfr: string | null;
  setFilterMfr: (mfr: string | null) => void;
  parseEquipName: (name: string) => any;
  handlePhoneChange: (e: any) => void;
}

export const SalesEntrySection: React.FC<Props> = ({
  formData, setFormData, equipmentCatalog, filterMfr, setFilterMfr, parseEquipName, handlePhoneChange
}) => {
  const manufacturers = Array.from(new Set(equipmentCatalog.map((item: any) => parseEquipName(item.name).mfr))).sort();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">客户名称</label>
          <input 
            type="text" 
            className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
            placeholder="张三"
            value={formData.customer_name}
            onChange={e => setFormData({...formData, customer_name: e.target.value})}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-400">结算方式</label>
          <select 
            className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
            value={formData.settlement_type}
            onChange={e => setFormData({...formData, settlement_type: e.target.value as any})}
          >
            <option value="现结">现结</option>
            <option value="月结">月结</option>
            <option value="挂账">挂账</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm text-slate-400">分配设备 (已购设备库)</label>
        {equipmentCatalog && equipmentCatalog.length > 0 && (
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => setFilterMfr(null)}
                className={`px-2 py-1 text-[9px] font-bold rounded transition-all border ${!filterMfr ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white/5 text-slate-500 border-white/5'}`}
              >
                全部厂家
              </button>
              {manufacturers.map(mfr => (
                <button
                  key={mfr}
                  type="button"
                  onClick={() => setFilterMfr(mfr)}
                  className={`px-2 py-1 text-[9px] font-bold rounded transition-all border ${filterMfr === mfr ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white/5 text-slate-500 border-white/5'}`}
                >
                  {mfr}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {equipmentCatalog
                .filter((item: any) => !filterMfr || parseEquipName(item.name).mfr === filterMfr)
                .map((item: any) => {
                  const isSelected = formData.assigned_equipment.includes(item.name);
                  const { mfr, model } = parseEquipName(item.name);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const current = formData.assigned_equipment;
                        const itemsList = current ? current.split(/[,，]/).map((i: string) => i.trim()).filter(Boolean) : [];
                        let next;
                        if (itemsList.includes(item.name)) {
                          next = itemsList.filter((i: string) => i !== item.name).join(', ');
                        } else {
                          next = [...itemsList, item.name].join(', ');
                        }
                        setFormData({...formData, assigned_equipment: next});
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-2 ${
                        isSelected 
                          ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                          : 'bg-white/5 text-slate-400 border-white/10 hover:border-brand-primary/40'
                      }`}
                    >
                      {!filterMfr && <span className="opacity-40 text-[9px] font-normal">{mfr}</span>}
                      {model}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        <input 
          type="text" 
          className="w-full bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white text-sm"
          placeholder="可点选上方标签，或手动输入..."
          value={formData.assigned_equipment}
          onChange={e => setFormData({...formData, assigned_equipment: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">联系电话 (11位)</label>
          <input 
            type="text" 
            className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
            value={formData.phone}
            onChange={handlePhoneChange}
            maxLength={11}
          />
        </div>
      </div>
    </div>
  );
};
