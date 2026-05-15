import React from 'react';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  inputUnit: string;
  toggleUnit: () => void;
  purchaseDetails: any;
}

export const CommonFields: React.FC<Props> = ({
  formData, setFormData, inputUnit, toggleUnit, purchaseDetails
}) => {
  const isSales = formData.type === '销售录入';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-brand-primary font-bold">
              数量 ({formData.type === '燃油采购' ? 'kg' : (formData.type === '设备采购' ? '个' : inputUnit)})
            </label>
            {isSales && (
              <button type="button" onClick={toggleUnit} className="text-[10px] bg-brand-primary/20 px-2 py-0.5 rounded-full hover:bg-brand-primary transition-all">
                换为{inputUnit === 'kg' ? '斤' : 'kg'}
              </button>
            )}
          </div>
          <input 
            type="number" step="any"
            className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
            value={formData.quantity}
            onChange={e => setFormData({...formData, quantity: e.target.value})}
            required
            disabled={purchaseDetails.isAuto}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-brand-primary font-bold">
            单价 (¥/{formData.type === '燃油采购' ? 'kg' : (formData.type === '设备采购' ? '个' : inputUnit)})
          </label>
          <input 
            type="number" step="any"
            className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
            placeholder="输入单价..."
            value={formData.unit_price}
            onChange={e => setFormData({...formData, unit_price: e.target.value})}
            disabled={purchaseDetails.isAuto}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-400">{isSales ? '应收总额 (¥)' : '总计金额 (¥)'}</label>
          <input 
            type="number" step="any"
            className={`w-full ${isSales ? 'bg-emerald-400/5 border-emerald-400/20 text-emerald-400' : 'bg-bg-secondary border-white/10 text-white'} rounded-xl p-3 outline-none focus:border-brand-primary font-bold`}
            placeholder={isSales ? "自动计算..." : "输入金额"}
            value={isSales ? formData.total_price : formData.amount}
            onChange={e => setFormData({...formData, [isSales ? 'total_price' : 'amount']: e.target.value})}
            required
            disabled={purchaseDetails.isAuto}
          />
        </div>
        {isSales && (
          <div className="space-y-2">
            <label className="text-sm text-slate-400">本次实收 (¥)</label>
            <input 
              type="number" step="any"
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
              placeholder="不填为0"
              value={formData.paid_amount}
              onChange={e => setFormData({...formData, paid_amount: e.target.value})}
            />
          </div>
        )}
        {!isSales && (
          <div className="space-y-2">
            <label className="text-sm text-slate-400">日期</label>
            <input 
              type="date" 
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
        )}
      </div>

      {isSales && (
        <div className="space-y-2">
          <label className="text-sm text-slate-400">订货日期</label>
          <input 
            type="date" 
            className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
      )}
    </div>
  );
};
