import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Phone as PhoneIcon, Package, History as HistoryIcon, HandCoins, AlertCircle, BadgeDollarSign, ShoppingCart } from 'lucide-react';
import { kgToJin } from '../../utils/index';
import type { Sale, Transaction } from '../../types/index';

export const MerchantExpandableRow = ({ stat, sales, transactions, onNewOrder, onEdit, onDelete, onQuickPay }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = stat.total_amount > 0 ? (stat.total_paid / stat.total_amount) * 100 : 0;

  // BULL-PROOF LEDGER GENERATOR
  const combinedList = useMemo(() => {
    const list: any[] = [];
    
    // 1. Find all orders for this merchant
    const merchantOrders = sales.filter((s: Sale) => s.customer_name === stat.customer_name);
    // 2. Find ALL payment transactions for this merchant
    const merchantPayments = transactions.filter((t: Transaction) => 
      t.type === '收入' && 
      t.title.includes(stat.customer_name)
    );

    // 3. Process orders
    merchantOrders.forEach(s => {
      list.push({ 
        date: s.delivery_date, 
        type: '订油 (销售)', 
        amountDue: s.total_price, 
        amountPaid: 0, // This will be filled if there's a payment on the SAME DAY
        sortKey: `${s.delivery_date}_0`,
        id: s.id,
        notes: s.notes
      });
    });

    // 4. Process all payments independently
    merchantPayments.forEach(t => {
      list.push({ 
        date: t.date, 
        type: '收款 (还账)', 
        amountDue: 0, 
        amountPaid: t.amount, 
        sortKey: `${t.date}_1`,
        id: t.id,
        notes: t.notes
      });
    });
    
    // 5. SORT oldest to newest for linear balance calculation
    list.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    // 6. SMART MERGE: If order and payment are on the SAME DAY, merge them into one "现结" row
    const mergedList: any[] = [];
    const processedPaymentIds = new Set();

    list.forEach((item, idx) => {
      if (item.type === '订油 (销售)') {
        // Look for a payment on the same date that hasn't been used yet
        const sameDayPayment = list.find(p => 
          p.type === '收款 (还账)' && 
          p.date === item.date && 
          !processedPaymentIds.has(p.id)
        );

        if (sameDayPayment) {
          mergedList.push({
            ...item,
            type: '订油 (现结)',
            amountPaid: sameDayPayment.amountPaid,
            notes: (item.notes ? item.notes + ' | ' : '') + (sameDayPayment.notes || '当日结清')
          });
          processedPaymentIds.add(sameDayPayment.id);
        } else {
          mergedList.push({
            ...item,
            type: '订油 (赊账)'
          });
        }
      } else if (item.type === '收款 (还账)') {
        if (!processedPaymentIds.has(item.id)) {
          mergedList.push(item);
        }
      }
    });

    // 7. Calculate running balance on the merged list
    let bal = 0;
    const final = mergedList.map(item => {
      bal = bal + (item.amountDue || 0) - (item.amountPaid || 0);
      return { ...item, balance: bal };
    });
    
    return final.reverse(); // Newest first for display
  }, [sales, transactions, stat.customer_name]);

  return (
    <>
      <tr 
        className={`hover:bg-white/5 transition-colors cursor-pointer group ${isExpanded ? 'bg-white/5' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="py-5 px-4">
          <div className="flex items-center gap-3">
            {isExpanded ? <ChevronUp size={16} className="text-brand-primary" /> : <ChevronDown size={16} className="text-slate-500" />}
            <div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-white text-lg">{stat.customer_name}</div>
                {stat.settlement_type && (
                  <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] rounded border border-brand-primary/20">{stat.settlement_type}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <div className="flex items-center gap-1"><PhoneIcon size={10} /> {stat.phone || '未记录电话'}</div>
                {stat.assigned_equipment && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded border border-brand-primary/20">
                    <Package size={10} /> 
                    <span className="font-bold">设备: {stat.assigned_equipment}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="py-5 px-2 text-right">
          <div className="text-white font-bold">{stat.total_quantity.toLocaleString()} kg</div>
          <div className="text-[10px] text-brand-primary">折合: {kgToJin(stat.total_quantity).toLocaleString()} 斤</div>
          <div className="text-[10px] text-slate-500 mt-0.5">订单数: {stat.records_count}</div>
        </td>
        <td className="py-5 px-2 text-right text-emerald-400">¥ {stat.total_paid.toLocaleString()}</td>
        <td className="py-5 px-2 text-right">
          <span className={`font-black text-xl ${stat.total_debt > 0.01 ? 'text-rose-400' : 'text-emerald-400'}`}>
            ¥ {Math.max(0, stat.total_debt).toLocaleString()}
          </span>
        </td>
        <td className="py-5 px-2 text-center min-w-[120px]">
          <div className="flex flex-col items-center gap-1 px-4">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary" style={{width: `${progress}%`}} />
            </div>
            <span className="text-[10px] text-slate-500 font-bold">{progress.toFixed(1)}%</span>
          </div>
        </td>
        <td className="py-5 px-4 text-right" onClick={e => e.stopPropagation()}>
           <button 
            onClick={() => onNewOrder(stat.customer_name, stat.phone, stat.settlement_type)}
            className="btn-primary py-2 px-3 text-xs flex items-center gap-2 justify-end ml-auto"
           >
             <ShoppingCart size={14} /> 再订一单
           </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0 border-b border-white/5 bg-black/40">
            <div className="p-6 animate-in slide-in-from-top-2 duration-300">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <HistoryIcon className="text-brand-primary" size={18} /> 真实对账流水 (含备注说明)
                  </h3>
                  <div className="flex gap-4 text-xs">
                     <div className="text-slate-400">商户: <span className="text-white font-bold">{stat.customer_name}</span></div>
                     <div className="text-slate-400">总欠款: <span className="text-rose-400 font-bold">¥{Math.max(0, stat.total_debt).toLocaleString()}</span></div>
                  </div>
               </div>
               <div className="overflow-hidden rounded-2xl border border-white/10 bg-bg-secondary shadow-2xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                        <th className="py-4 px-6 text-left font-bold uppercase tracking-wider">日期</th>
                        <th className="py-4 px-6 text-left font-bold uppercase tracking-wider">事项内容</th>
                        <th className="py-4 px-6 text-left font-bold uppercase tracking-wider">备注说明</th>
                        <th className="py-4 px-6 text-right font-bold uppercase tracking-wider text-rose-400">应收 (油钱)</th>
                        <th className="py-4 px-6 text-right font-bold uppercase tracking-wider text-emerald-400">实收 (已付)</th>
                        <th className="py-4 px-6 text-right font-bold uppercase tracking-wider bg-white/5">剩余总欠款</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {combinedList.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors group">
                          <td className="py-4 px-6 text-slate-400 font-mono">{row.date}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 font-bold px-2 py-1 rounded-lg text-[10px] ${row.type.includes('现结') ? 'bg-emerald-400/10 text-emerald-400' : row.type.includes('赊账') ? 'bg-rose-400/10 text-rose-400' : 'bg-brand-primary/10 text-brand-primary'}`}>
                              {row.type.includes('现结') ? <HandCoins size={12} /> : row.type.includes('赊账') ? <AlertCircle size={12} /> : <BadgeDollarSign size={12} />}
                              {row.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 text-[11px] max-w-[200px] truncate" title={row.notes}>
                            {row.notes || '-'}
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-white">
                            {row.amountDue > 0 ? `¥${row.amountDue.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-emerald-400">
                            {row.amountPaid > 0 ? `¥${row.amountPaid.toLocaleString()}` : '-'}
                          </td>
                          <td className={`py-4 px-6 text-right font-black bg-white/5 group-hover:bg-white/10 transition-colors ${row.balance > 0.01 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            ¥ {Math.max(0, row.balance).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {combinedList.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-slate-600 italic">该商户暂无任何订货或往来记录</td></tr>}
                    </tbody>
                  </table>
               </div>
               <div className="mt-4 p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10 text-[11px] text-slate-500 italic flex justify-between items-center">
                 <span>提示：系统会自动匹配日期，只有【同一天】订油且交钱才记为现结，不同日期的订油和还款将分开显示。</span>
                 <span className="text-emerald-400">当前商户状态：{stat.total_debt > 0.01 ? '有欠款待追回' : '账目已清'}</span>
               </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
