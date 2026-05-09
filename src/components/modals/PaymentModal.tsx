import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, sale, onProcessPayment, isSubmitting }: any) => {
  const [payAmount, setPayAmount] = useState('');
  const debt = sale ? Number(sale.total_price) - Number(sale.paid_amount) : 0;

  if (!isOpen || !sale) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payAmount);
    if (amount <= 0) return alert('请输入有效还款金额');
    if (amount > debt + 0.01) return alert('还款金额不能超过剩余欠款');
    onProcessPayment(sale, amount);
    setPayAmount('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1100] p-4">
      <div className="glass-card w-full max-md:max-w-full max-w-md p-8 animate-in zoom-in duration-200">
        <h2 className="text-xl font-bold text-white mb-2">还款录入</h2>
        <p className="text-slate-400 text-sm mb-6">商家: {sale.customer_name} | 待付金额: <span className="text-rose-400 font-bold">¥{debt.toLocaleString()}</span></p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">本次还款金额 (¥)</label>
            <input 
              type="number" step="any" autoFocus
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-4 text-2xl font-bold text-brand-primary outline-none focus:border-brand-primary"
              placeholder="输入收款金额..."
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">取消</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary py-3 justify-center">
              {isSubmitting ? <Loader2 className="animate-spin" /> : '确认收款'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
