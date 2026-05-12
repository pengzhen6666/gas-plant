import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { RecordType, SettlementType } from '../../types/index';
import { jinToKg } from '../../utils/index';
import { parseEquipName } from '../../config/equipment';

export const RecordModal = ({ isOpen, onClose, onAddTransaction, onAddSale, onUpdateTransaction, onUpdateSale, isSubmitting, editData, prefillData, equipmentCatalog }: any) => {
  const [inputUnit, setInputUnit] = useState<'kg' | '斤'>('kg');
  const [formData, setFormData] = useState({
    type: '收入' as RecordType,
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit_price: '',
    notes: '',
    customer_name: '',
    phone: '',
    total_price: '',
    paid_amount: '',
    payment_date: '',
    settlement_type: '现结' as SettlementType,
    category: '',
    assigned_equipment: '',
  });

  useEffect(() => {
    if (editData) {
      if ('customer_name' in editData) {
        setFormData({
          type: '销售录入',
          title: '',
          amount: '',
          date: editData.delivery_date,
          quantity: editData.quantity.toString(),
          unit_price: '', 
          notes: editData.notes || '',
          customer_name: editData.customer_name,
          phone: editData.phone || '',
          total_price: editData.total_price.toString(),
          paid_amount: editData.paid_amount.toString(),
          payment_date: editData.payment_date || '',
          settlement_type: editData.settlement_type || '现结',
          category: '',
          assigned_equipment: editData.assigned_equipment || '',
        });
        if (editData.quantity > 0) {
           const up = (editData.total_price / editData.quantity).toFixed(2).replace(/\.?0+$/, '');
           setFormData(prev => ({...prev, unit_price: up}));
        }
        setInputUnit('kg'); 
      } else {
        setFormData({
          type: editData.type,
          title: editData.title,
          amount: editData.amount.toString(),
          date: editData.date,
          quantity: editData.quantity?.replace(/[^\d.]/g, '') || '', 
          unit_price: '',
          notes: editData.notes || '',
          customer_name: '',
          phone: '',
          total_price: '',
          paid_amount: '',
          payment_date: '',
          settlement_type: '现结',
          category: editData.category || '',
          assigned_equipment: '',
        });
        const qtyNum = parseFloat(editData.quantity || '0');
        if (qtyNum > 0) {
           const up = (editData.amount / qtyNum).toFixed(2).replace(/\.?0+$/, '');
           setFormData(prev => ({...prev, unit_price: up}));
        }
      }
    } else if (prefillData) {
      setFormData({
        type: '销售录入',
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        unit_price: '',
        notes: '',
        customer_name: prefillData.customer_name || '',
        phone: prefillData.phone || '',
        total_price: '',
        paid_amount: '',
        payment_date: '',
        settlement_type: prefillData.settlement_type || '现结',
        category: '',
        assigned_equipment: prefillData.assigned_equipment || '',
      });
    } else {
      setFormData({
        type: '收入',
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        unit_price: '',
        notes: '',
        customer_name: '',
        phone: '',
        total_price: '',
        paid_amount: '',
        payment_date: '',
        settlement_type: '现结',
        category: '',
        assigned_equipment: '',
      });
    }
  }, [editData, prefillData, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const up = parseFloat(formData.unit_price);
    const qty = parseFloat(formData.quantity);
    if (!isNaN(up) && !isNaN(qty) && up > 0 && qty > 0) {
      const total = (up * qty).toFixed(2).replace(/\.?0+$/, '');
      if (formData.type === '销售录入') {
        if (formData.total_price !== total) {
          setFormData(prev => ({...prev, total_price: total}));
        }
      } else if (formData.type === '燃油采购' || formData.type === '设备采购') {
        if (formData.amount !== total) {
          setFormData(prev => ({...prev, amount: total}));
        }
      }
    }
  }, [formData.unit_price, formData.quantity, formData.type, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === '销售录入' && formData.phone) {
      const phoneClean = formData.phone.replace(/\s/g, '');
      if (!/^\d{11}$/.test(phoneClean)) {
        alert('请输入正确的11位手机号码');
        return;
      }
    }

    if (formData.type === '销售录入') {
      const totalPrice = Number(formData.total_price);
      const paidAmount = Number(formData.paid_amount);
      let status: any = '未付款';
      if (paidAmount >= totalPrice - 0.01) status = '已付款';
      else if (paidAmount > 0) status = '部分付款';

      const finalQuantity = inputUnit === '斤' ? jinToKg(formData.quantity) : Number(formData.quantity);

      const saleData = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        delivery_date: formData.date,
        quantity: finalQuantity,
        total_price: totalPrice,
        paid_amount: paidAmount,
        status: status,
        payment_date: formData.payment_date || null,
        notes: formData.notes,
        settlement_type: formData.settlement_type,
        assigned_equipment: formData.assigned_equipment
      };

      if (editData && 'customer_name' in editData) {
        onUpdateSale(editData.id, saleData);
      } else {
        onAddSale(saleData);
      }
    } else {
      const txData = {
        type: formData.type,
        title: formData.title,
        amount: Number(formData.amount),
        date: formData.date,
        quantity: formData.type === '燃油采购' ? `${formData.quantity}kg` : (formData.type === '设备采购' ? `${formData.quantity}个` : formData.quantity),
        notes: formData.notes,
        category: formData.type === '设备采购' ? formData.category : undefined
      };

      if (editData && !('customer_name' in editData)) {
        onUpdateTransaction(editData.id, txData);
      } else {
        onAddTransaction(txData);
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, ''); 
    if (val.length <= 11) {
      setFormData({...formData, phone: val});
    }
  };

  const toggleUnit = () => {
    if (!formData.quantity) {
      setInputUnit(inputUnit === 'kg' ? '斤' : 'kg');
      return;
    }
    if (inputUnit === 'kg') {
      setFormData({...formData, quantity: (Number(formData.quantity) * 2).toFixed(2).replace(/\.?0+$/, '')});
      setInputUnit('斤');
    } else {
      setFormData({...formData, quantity: (Number(formData.quantity) / 2).toFixed(2).replace(/\.?0+$/, '')});
      setInputUnit('kg');
    }
  };

  const parseEquipName = (fullName: string) => {
    const parts = fullName.split('::');
    if (parts.length === 3) return { cat: parts[0], mfr: parts[1], model: parts[2] };
    return { cat: '', mfr: '', model: fullName };
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="glass-card w-full max-w-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{editData ? '编辑记录' : (prefillData ? '老客户续订' : '新增记录')}</h2>
          <X size={24} onClick={onClose} className="cursor-pointer text-slate-400 hover:text-white transition-colors" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">记录类型</label>
            <select 
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as RecordType})}
              disabled={isSubmitting || !!editData || !!prefillData}
            >
              <option value="收入">日常收入</option>
              <option value="支出">日常支出</option>
              <option value="燃油采购">燃油进货 (采购)</option>
              <option value="设备采购">设备采购 (炉灶/配件)</option>
              <option value="销售录入">销售油品 (卖给商家)</option>
            </select>
          </div>

          {formData.type === '销售录入' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">商家名称</label>
                  <input 
                    type="text" 
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                    placeholder="商家全称..."
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
                    onChange={e => setFormData({...formData, settlement_type: e.target.value as SettlementType})}
                  >
                    <option value="现结">现结</option>
                    <option value="月结">月结</option>
                    <option value="押一付一">押一付一</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm text-brand-primary font-bold">配备设备 (商户正在使用的炉灶/油箱等)</label>
                
                {/* Quick Select Buttons */}
                {equipmentCatalog && equipmentCatalog.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {equipmentCatalog.map((item: any) => {
                      const isSelected = formData.assigned_equipment.includes(item.name);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            const current = formData.assigned_equipment;
                            const items = current ? current.split(/[,，]/).map(i => i.trim()).filter(Boolean) : [];
                            let next;
                            if (items.includes(item.name)) {
                              next = items.filter(i => i !== item.name).join(', ');
                            } else {
                              next = [...items, item.name].join(', ');
                            }
                            setFormData({...formData, assigned_equipment: next});
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                            isSelected 
                              ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                              : 'bg-white/5 text-slate-400 border-white/10 hover:border-brand-primary/40'
                          }`}
                        >
                          {item.name}
                        </button>
                      );
                    })}
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
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">订货日期</label>
                  <input 
                    type="date" 
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-brand-primary font-bold">数量 ({inputUnit})</label>
                    <button type="button" onClick={toggleUnit} className="text-[10px] bg-brand-primary/20 px-2 py-0.5 rounded-full hover:bg-brand-primary transition-all">
                      换为{inputUnit === 'kg' ? '斤' : 'kg'}
                    </button>
                  </div>
                  <input 
                    type="number" step="any"
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-brand-primary font-bold">单价 (¥/{inputUnit})</label>
                  <input 
                    type="number" step="any"
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
                    placeholder="输入单价..."
                    value={formData.unit_price}
                    onChange={e => setFormData({...formData, unit_price: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">本次总计应收 (¥)</label>
                  <input 
                    type="number" step="any"
                    className="w-full bg-emerald-400/5 border border-emerald-400/20 rounded-xl p-3 outline-none focus:border-emerald-400 font-bold text-emerald-400"
                    placeholder="自动计算..."
                    value={formData.total_price}
                    onChange={e => setFormData({...formData, total_price: e.target.value})}
                    required
                  />
                </div>
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
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">摘要内容 (型号/名称)</label>
                
                {formData.type === '设备采购' && equipmentCatalog && equipmentCatalog.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2 p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="w-full text-[10px] text-brand-primary font-bold mb-1 uppercase tracking-wider">从资产库点选型号:</p>
                    {equipmentCatalog.map((item: any) => {
                      const { mfr, model } = parseEquipName(item.name);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData, 
                              title: `${mfr} ${model}`,
                              unit_price: item.price.toString(),
                              category: item.name.split('::')[0]
                            });
                          }}
                          className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all"
                        >
                          {mfr} {model} (¥{item.price})
                        </button>
                      );
                    })}
                  </div>
                )}

                <input 
                  type="text" 
                  className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                  placeholder="输入或点击上方型号..."
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              {formData.type === '设备采购' && (
                <div className="space-y-2">
                  <label className="text-sm text-brand-primary font-bold">设备种类</label>
                  <select 
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">-- 请选择设备种类 --</option>
                    <option value="油箱">油箱</option>
                    <option value="炉灶">炉灶</option>
                    <option value="煲仔炉">煲仔炉</option>
                    <option value="汤炉">汤炉</option>
                    <option value="蒸柜">蒸柜</option>
                    <option value="运费">运费</option>
                    <option value="其他配件">其他配件</option>
                  </select>
                </div>
              )}

              {(formData.type === '燃油采购' || formData.type === '设备采购') ? (
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="space-y-2">
                    <label className="text-sm text-brand-primary font-bold">数量 ({formData.type === '燃油采购' ? 'kg' : '个'})</label>
                    <input 
                      type="number" step="any"
                      className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-brand-primary font-bold">采购单价 (¥)</label>
                    <input 
                      type="number" step="any"
                      className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary text-white"
                      placeholder="输入单价..."
                      value={formData.unit_price}
                      onChange={e => setFormData({...formData, unit_price: e.target.value})}
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">总计金额 (¥)</label>
                  <input 
                    type="number" step="any"
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white font-bold"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">日期</label>
                  <input 
                    type="date" 
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm text-slate-400">备注 (可选)</label>
            <textarea 
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white min-h-[80px]"
              placeholder="添加额外信息..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              disabled={isSubmitting}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full justify-center py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (editData ? '保存修改' : '确认录入')}
          </button>
        </form>
      </div>
    </div>
  );
};
