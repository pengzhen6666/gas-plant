import React from 'react';

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  inputUnit: string;
  toggleUnit: () => void;
  purchaseDetails: any;
  setPurchaseDetails: (data: any) => void;
}

export const CommonFields: React.FC<Props> = ({
  formData, setFormData, inputUnit, toggleUnit, purchaseDetails, setPurchaseDetails
}) => {
  const isSales = formData.type === '销售录入';
  const isProcurement = formData.type === '燃油采购' || formData.type === '设备采购';

  return (
    <div className="space-y-5">
      {isProcurement && (
        <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-primary/10 rounded-lg">
                <div className="w-3 h-3 text-brand-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">本项物流运费 (按体积/平方分摊)</span>
            </div>
            
            <button 
              type="button"
              onClick={() => setPurchaseDetails({...purchaseDetails, distributeShipping: !purchaseDetails.distributeShipping})}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <span className={`text-[9px] font-bold transition-colors ${purchaseDetails.distributeShipping ? 'text-brand-primary' : 'text-slate-500'}`}>
                {purchaseDetails.distributeShipping ? '已计入成本' : '计入单台成本'}
              </span>
              <div className={`w-8 h-4 rounded-full transition-all relative ${purchaseDetails.distributeShipping ? 'bg-brand-primary shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.3)]' : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm`} style={{ left: purchaseDetails.distributeShipping ? '18px' : '2px' }} />
              </div>
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="relative group/input">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary font-bold text-sm">¥</span>
              <input 
                type="number" step="any"
                className="w-full bg-black/20 border border-white/5 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:border-brand-primary/50 transition-all text-white text-sm placeholder:text-slate-700"
                placeholder="输入本批次采购的总运费..."
                value={purchaseDetails.shippingFee}
                onChange={e => setPurchaseDetails({...purchaseDetails, shippingFee: e.target.value})}
              />
            </div>
            
            {purchaseDetails.distributeShipping && (
              <div className="flex items-center justify-between px-3 py-2 bg-brand-primary/5 rounded-xl border border-brand-primary/10 animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[10px] text-slate-500 font-medium">每台/每单位预计增加成本:</span>
                <span className="text-sm font-black text-brand-primary">
                  ¥ {parseFloat(formData.quantity) > 0 ? (parseFloat(purchaseDetails.shippingFee || '0') / parseFloat(formData.quantity)).toFixed(2) : '0.00'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-brand-primary font-bold">
              数量 ({formData.type === '燃油采购' ? 'kg' : (formData.type === '设备采购' ? '个' : (isSales ? inputUnit : '项'))})
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
            单价 (¥/{formData.type === '燃油采购' ? 'kg' : (formData.type === '设备采购' ? '个' : (isSales ? inputUnit : '项'))})
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
