import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRightLeft, TrendingUp, Info, Save, History as HistoryIcon, Trash2, RotateCcw, X } from 'lucide-react';


import { priceKgToL, priceLToKg, priceJinToKg, priceKgToJin } from '../../utils';
import { supabase } from '../../lib/supabase';
import type { FuelQuote } from '../../types/index';





export const FuelCalculator: React.FC = () => {
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [density, setDensity] = useState<string>('0.85'); 
  const [unitType, setUnitType] = useState<'kg' | 'L' | 'jin'>('kg');

  // Purchase Details
  const [totalCost, setTotalCost] = useState<string>('');
  const [totalQty, setTotalQty] = useState<string>('');
  const [batchUnit, setBatchUnit] = useState<'ton' | 'kg' | 'L'>('ton');
  const [shippingFee, setShippingFee] = useState<string>('');
  const [packagingFee, setPackagingFee] = useState<string>('');
  const [factoryQuote, setFactoryQuote] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [recordDate, setRecordDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [barrelVol, setBarrelVol] = useState<string>('1000');
  const [quotes, setQuotes] = useState<FuelQuote[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('全部');


  
  // Density Helper States
  const [helperKg, setHelperKg] = useState<string>('');
  const [helperL, setHelperL] = useState<string>('');



  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('fuel_quotes')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);
      if (error) {
        if (error.code !== '42P01') console.error('Error fetching quotes:', error);
        return;
      }
      setQuotes(data || []);
    } catch (e) { console.error(e); }
  };

  const pricePerLFromQuote = (Number(factoryQuote) * (Number(density) || 0.85)) / 1000;
  const currentBarrelPrice = pricePerLFromQuote * (Number(barrelVol) || 1000);

  const saveQuote = async () => {


    if (!factoryQuote || isSaving) return;
    setIsSaving(true);
    try {
      const newQuote = {
        factory_price: Number(factoryQuote),
        density: Number(density) || 0.85,
        ton_barrel_price: currentBarrelPrice,
        total_cost: Number(totalCost) || 0,

        total_qty: Number(totalQty) || 0,
        batch_unit: batchUnit,
        shipping_fee: Number(shippingFee) || 0,
        packaging_fee: Number(packagingFee) || 0,
        selling_price: Number(sellingPrice) || 0,
        unit_type: unitType,
        barrel_vol: Number(barrelVol) || 1000,
        date: recordDate,
        notes: notes
      };


    const { error } = editingId 
        ? await supabase.from('fuel_quotes').update(newQuote).eq('id', editingId)
        : await supabase.from('fuel_quotes').insert([newQuote]);

      if (error) throw error;
      if (!editingId) setNotes('');
      fetchQuotes();
      setIsModalOpen(false); // Close modal after saving
    } catch (e: any) {


      alert('保存失败: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteQuote = async (id: string) => {
    if (!confirm('确定删除此记录吗？')) return;
    try {
      const { error } = await supabase.from('fuel_quotes').delete().eq('id', id);
      if (error) throw error;
      setQuotes(quotes.filter(q => q.id !== id));
    } catch (e) { alert('删除失败'); }
  };

  const applyHistoryRecord = (q: FuelQuote) => {
    setDensity(String(q.density || '0.85'));
    setFactoryQuote(String(q.factory_price || ''));
    setTotalCost(String(q.total_cost || ''));
    setTotalQty(String(q.total_qty || ''));
    setBatchUnit(q.batch_unit || 'ton');
    setShippingFee(String(q.shipping_fee || ''));
    setPackagingFee(String(q.packaging_fee || ''));
    setSellingPrice(String(q.selling_price || ''));
    setUnitType(q.unit_type || 'kg');
    setNotes(q.notes || '');
    setRecordDate(q.date || new Date().toISOString().split('T')[0]);
    setBarrelVol(String(q.barrel_vol || '1000'));
    setEditingId(q.id);
    setIsModalOpen(true);
  };






  const clearAll = () => {
    setDensity('0.85');
    setFactoryQuote('');
    setTotalCost('');
    setTotalQty('');
    setBatchUnit('ton');
    setShippingFee('');
    setPackagingFee('');
    setSellingPrice('');
    setNotes('');
    setRecordDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
    setIsModalOpen(false);
  };



  const applyTonBarrel = () => {
    if (!isNaN(currentBarrelPrice) && currentBarrelPrice > 0) {
      setTotalCost(currentBarrelPrice.toFixed(2));
      setTotalQty(barrelVol);
      setBatchUnit('L');
    }
  };


  const applyDensityHelper = () => {
    const kg = Number(helperKg);
    const l = Number(helperL);
    if (kg > 0 && l > 0) {
      setDensity((kg / l).toFixed(3));
      setHelperKg('');
      setHelperL('');
    }
  };

  useEffect(() => {
    const cost = Number(totalCost) || 0;
    const qty = Number(totalQty) || 0;
    const shipping = Number(shippingFee) || 0;
    const packaging = Number(packagingFee) || 0;
    const d = Number(density) || 0.85;
    
    const grandTotal = cost + shipping + packaging;

    if (qty > 0) {
      let unitPrice = 0;
      if (batchUnit === 'ton') {
        const pricePerKg = grandTotal / (qty * 1000);
        if (unitType === 'kg') unitPrice = pricePerKg;
        else if (unitType === 'jin') unitPrice = priceKgToJin(pricePerKg);
        else if (unitType === 'L') unitPrice = priceKgToL(pricePerKg, d);
      } else if (batchUnit === 'kg') {
        const pricePerKg = grandTotal / qty;
        if (unitType === 'kg') unitPrice = pricePerKg;
        else if (unitType === 'jin') unitPrice = priceKgToJin(pricePerKg);
        else if (unitType === 'L') unitPrice = priceKgToL(pricePerKg, d);
      } else if (batchUnit === 'L') {
        const pricePerL = grandTotal / qty;
        if (unitType === 'L') unitPrice = pricePerL;
        else if (unitType === 'kg') unitPrice = priceLToKg(pricePerL, d);
        else if (unitType === 'jin') unitPrice = priceKgToJin(priceLToKg(pricePerL, d));
      }
      setPurchasePrice(unitPrice > 0 ? unitPrice.toFixed(3) : '');
    } else {
      setPurchasePrice('');
    }
  }, [totalCost, totalQty, batchUnit, shippingFee, packagingFee, unitType, density]);






  const [results, setResults] = useState({

    purchaseL: 0,
    purchaseKg: 0,
    purchaseJin: 0,
    sellingL: 0,
    sellingKg: 0,
    sellingJin: 0,
    profitL: 0,
    profitKg: 0,
    profitJin: 0,
    margin: 0
  });

  useEffect(() => {
    const p = Number(purchasePrice) || 0;
    const s = Number(sellingPrice) || 0;
    const d = Number(density) || 0.85;

    let pKg = 0;
    let sKg = 0;

    if (unitType === 'kg') {
      pKg = p;
      sKg = s;
    } else if (unitType === 'L') {
      pKg = priceLToKg(p, d);
      sKg = priceLToKg(s, d);
    } else if (unitType === 'jin') {
      pKg = priceJinToKg(p);
      sKg = priceJinToKg(s);
    }

    const pL = priceKgToL(pKg, d);
    const sL = priceKgToL(sKg, d);
    const pJin = priceKgToJin(pKg);
    const sJin = priceKgToJin(sKg);

    const profitKg = sKg - pKg;
    const profitL = sL - pL;
    const profitJin = sJin - pJin;
    const margin = sKg > 0 ? (profitKg / sKg) * 100 : 0;

    setResults({
      purchaseL: pL,
      purchaseKg: pKg,
      purchaseJin: pJin,
      sellingL: sL,
      sellingKg: sKg,
      sellingJin: sJin,
      profitL: profitL,
      profitKg: profitKg,
      profitJin: profitJin,
      margin: margin
    });
  }, [purchasePrice, sellingPrice, density, unitType]);

  const handleUnitChange = (newUnit: 'kg' | 'L' | 'jin') => {
    if (newUnit === unitType) return;

    const d = Number(density) || 0.85;
    
    // Convert current selling price to the new unit
    const s = Number(sellingPrice);
    if (!isNaN(s) && s > 0) {
      let sKg = 0;
      if (unitType === 'kg') sKg = s;
      else if (unitType === 'L') sKg = priceLToKg(s, d);
      else if (unitType === 'jin') sKg = priceJinToKg(s);

      let newS = 0;
      if (newUnit === 'kg') newS = sKg;
      else if (newUnit === 'L') newS = priceKgToL(sKg, d);
      else if (newUnit === 'jin') newS = priceKgToJin(sKg);
      
      setSellingPrice(newS.toFixed(3));
    }

    setUnitType(newUnit);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Header & New Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary shadow-inner">
            <Calculator size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-white">价格换算与报价中心</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">基于密度与费率自动核算，全流程历史追溯</p>
          </div>
        </div>
        <button 
          onClick={() => {
            clearAll();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-2xl transition-all font-black shadow-2xl shadow-brand-primary/30 active:scale-95 group"
        >
          <Calculator size={20} className="group-hover:rotate-12 transition-transform" />
          新报价计算
        </button>
      </div>

      {/* History Table - Main View */}
      <div className="glass-card overflow-hidden bg-white/[0.01] border-white/5">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/20 rounded-lg">
              <HistoryIcon size={20} className="text-brand-primary" />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest text-white">历史报价记录</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">点击行可查看详细计算详情</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                {['全部', '宁煤', '桉燃'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${filterCategory === cat ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                共 {quotes.filter(q => filterCategory === '全部' || q.notes?.includes(filterCategory)).length} 条记录
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">日期</th>
                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">厂家报价</th>
                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">密度</th>
                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">折算吨桶</th>
                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">成本 ({unitType})</th>
                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">走势</th>
                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">备注/油品</th>
                <th className="py-5 px-6 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">操作</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {quotes
                .filter(q => filterCategory === '全部' || q.notes?.includes(filterCategory))
                .map((q, idx, filteredArr) => {
                  const prevSameNote = filteredArr.slice(idx + 1).find(prev => prev.notes === q.notes);
                  const diff = prevSameNote ? q.factory_price - prevSameNote.factory_price : 0;
                
                return (
                  <tr 
                    key={q.id} 
                    onClick={() => applyHistoryRecord(q)}
                    className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-all group cursor-pointer"
                  >
                    <td className="py-5 px-6 text-slate-400 font-bold text-xs">{q.date}</td>
                    <td className="py-5 px-6 font-black text-white text-base">¥{(q.factory_price || 0).toLocaleString()}</td>
                    <td className="py-5 px-6 text-slate-400 font-black">{q.density}</td>
                    <td className="py-5 px-6 font-black text-emerald-400">¥{(q.ton_barrel_price || 0).toLocaleString()}</td>
                    <td className="py-5 px-6 font-black text-brand-primary">¥{(q.total_cost || 0).toLocaleString()}</td>
                    <td className="py-5 px-6">
                      {diff !== 0 && (
                        <div className={`flex items-center gap-1.5 font-black text-[11px] px-3 py-1.5 rounded-lg w-fit ${diff > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {diff > 0 ? <TrendingUp size={14} className="rotate-0" /> : <TrendingUp size={14} className="rotate-180" />}
                          ¥{Math.abs(diff).toFixed(0)}
                        </div>
                      )}
                      {diff === 0 && prevSameNote && <span className="text-[11px] font-black text-slate-600 bg-white/5 px-3 py-1.5 rounded-lg">持平</span>}
                      {!prevSameNote && <span className="text-[11px] font-black text-slate-700">-</span>}
                    </td>
                    <td className="py-5 px-6 text-slate-400 font-black text-xs italic">{q.notes || '-'}</td>
                    <td className="py-5 px-6 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuote(q.id);
                        }}
                        className="p-3 bg-rose-500/5 text-slate-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {quotes.length === 0 && (
             <div className="py-32 text-center">
                <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
                  <Calculator size={40} className="text-slate-700" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-[0.2em]">暂无历史数据记录</p>
             </div>
          )}
        </div>
      </div>

      {/* Calculator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setIsModalOpen(false)} />
          <div className="glass-card relative w-full max-w-6xl bg-[#080808] border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300 rounded-[2.5rem]">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#080808]/80 backdrop-blur-xl z-30">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-brand-primary/10 rounded-2xl text-brand-primary shadow-inner">
                  <Calculator size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">{editingId ? '编辑计算详情' : '新报价智能核算'}</h3>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">
                    {editingId ? '当前正在调整历史存档数据' : '输入基础参数，系统将自动进行多维度利润解析'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={clearAll}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-xl transition-all text-[10px] font-black border border-white/5"
                >
                  <RotateCcw size={14} /> 重置
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto space-y-10">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                {/* Step 1 */}
                <div className="xl:col-span-4 space-y-4">
                  <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-5 h-5 rounded-lg bg-emerald-400/20 flex items-center justify-center text-[10px]">1</span>
                    基础参数与厂家报价
                  </p>
                  <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                          燃油密度 (kg/L)
                          <Info size={11} className="text-slate-700 cursor-help" />
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={density}
                          onChange={(e) => setDensity(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-black text-sm focus:outline-none focus:border-brand-primary/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">厂家单价 (元/吨)</label>
                        <input
                          type="number"
                          value={factoryQuote}
                          onChange={(e) => setFactoryQuote(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-black text-sm focus:outline-none focus:border-emerald-400/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-4 shadow-inner">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                        <ArrowRightLeft size={12} className="text-emerald-400" /> 密度辅助换算
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <input 
                            type="number"
                            placeholder="公斤"
                            value={helperKg}
                            onChange={(e) => {
                              const kg = e.target.value; setHelperKg(kg);
                              const d = Number(density) || 0.85;
                              if (kg && d > 0) setHelperL((Number(kg) / d).toFixed(1));
                              else setHelperL('');
                            }}
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[12px] text-white font-black focus:outline-none focus:border-brand-primary/30"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-700 font-black">KG</span>
                        </div>
                        <ArrowRightLeft size={14} className="text-slate-700" />
                        <div className="flex-1 relative">
                          <input 
                            type="number"
                            placeholder="升"
                            value={helperL}
                            onChange={(e) => {
                              const l = e.target.value; setHelperL(l);
                              const d = Number(density) || 0.85;
                              if (l && d > 0) setHelperKg((Number(l) * d).toFixed(1));
                              else setHelperKg('');
                            }}
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[12px] text-white font-black focus:outline-none focus:border-brand-primary/30"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-700 font-black">L</span>
                        </div>
                        <button 
                          onClick={applyDensityHelper}
                          className="px-3 py-2 bg-emerald-400 text-black text-[10px] font-black rounded-xl hover:bg-emerald-300 transition-all active:scale-95 shadow-lg shadow-emerald-400/20"
                        >
                          应用
                        </button>
                      </div>
                    </div>

                    <div className="bg-emerald-400/5 p-4 rounded-[1.5rem] border border-emerald-400/10 flex items-center justify-between group/barrel">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">自定义桶容</p>
                          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                            <input 
                              type="number"
                              value={barrelVol}
                              onChange={(e) => setBarrelVol(e.target.value)}
                              className="w-12 bg-transparent text-[11px] text-emerald-400 font-black focus:outline-none text-center"
                            />
                            <span className="text-[9px] text-slate-700 font-black ml-1">L</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-black text-xl">¥</span>
                          <input
                            type="number"
                            value={isNaN(currentBarrelPrice) || currentBarrelPrice === 0 ? '' : currentBarrelPrice.toFixed(2)}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const d = Number(density) || 0.85;
                              const vol = Number(barrelVol) || 1000;
                              if (val > 0 && d > 0 && vol > 0) {
                                const pricePerL = val / vol;
                                setFactoryQuote(((pricePerL * 1000) / d).toFixed(2));
                              } else {
                                setFactoryQuote('');
                              }
                            }}
                            placeholder="输入整桶价反推"
                            className="bg-transparent border-none p-0 text-emerald-400 font-black text-xl focus:outline-none w-full placeholder:text-emerald-400/20"
                          />
                        </div>
                      </div>
                      <button onClick={applyTonBarrel} className="px-6 py-3 bg-emerald-400 text-black hover:bg-emerald-300 text-xs font-black rounded-2xl transition-all shadow-xl shadow-emerald-400/20 active:scale-95">
                        应用
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                        {['宁煤', '桉燃'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setNotes(cat)}
                            className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${notes === cat ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="date" value={recordDate} onChange={e => setRecordDate(e.target.value)} className="w-[110px] bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-white text-[10px] font-black focus:outline-none" />
                        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="或手动输入备注" className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-white text-[10px] font-black focus:outline-none" />
                      </div>
                      <button 
                        onClick={saveQuote} 
                        disabled={!factoryQuote || isSaving}
                        className={`w-full py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-black ${editingId ? 'bg-amber-400 text-black hover:bg-amber-300' : 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20'}`}
                      >
                        {editingId ? <><Save size={14} /> 更新记录</> : <><Save size={14} /> 保存存档</>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="xl:col-span-5 space-y-4">
                  <p className="text-[11px] font-black text-brand-primary uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-5 h-5 rounded-lg bg-brand-primary/20 flex items-center justify-center text-[10px]">2</span>
                    进货成本核算
                  </p>
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] space-y-8">
                    <div className="grid grid-cols-3 gap-6">
                      <DetailInput label="货款金额" value={totalCost} onChange={setTotalCost} />
                      <DetailInput label="运费" value={shippingFee} onChange={setShippingFee} />
                      <DetailInput label="包装/杂费" value={packagingFee} onChange={setPackagingFee} />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">进货总量 ({batchUnit})</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={totalQty}
                          onChange={(e) => setTotalQty(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-black text-lg focus:outline-none focus:border-brand-primary/50 transition-all"
                        />
                        <select 
                          value={batchUnit}
                          onChange={(e) => {
                            const newUnit = e.target.value as any;
                            const qty = Number(totalQty);
                            const d = Number(density) || 0.85;
                            if (qty > 0) {
                              let baseKg = batchUnit === 'ton' ? qty * 1000 : (batchUnit === 'L' ? qty * d : qty);
                              let newQty = newUnit === 'ton' ? baseKg / 1000 : (newUnit === 'L' ? baseKg / d : baseKg);
                              setTotalQty(newQty.toFixed(newUnit === 'ton' ? 3 : 1));
                            }
                            setBatchUnit(newUnit);
                          }}
                          className="w-28 bg-white/5 border border-white/10 rounded-xl px-3 text-white font-black text-xs focus:outline-none appearance-none"
                        >
                          <option value="ton">吨 (t)</option>
                          <option value="kg">公斤 (kg)</option>
                          <option value="L">升 (L)</option>
                        </select>
                      </div>
                      <div className="flex gap-6 px-2">
                        {(() => {
                           const qty = Number(totalQty) || 0;
                           const d = Number(density) || 0.85;
                           let l = batchUnit === 'L' ? qty : (batchUnit === 'ton' ? qty * 1000 / d : qty / d);
                           let kg = batchUnit === 'kg' ? qty : (batchUnit === 'ton' ? qty * 1000 : qty * d);
                           return (
                             <>
                               <span className="text-xs text-slate-600 font-black uppercase tracking-tighter">≈ {l.toFixed(1)} L</span>
                               <span className="text-xs text-slate-600 font-black uppercase tracking-tighter">≈ {kg.toFixed(1)} kg</span>
                               <span className="text-xs text-slate-600 font-black uppercase tracking-tighter">≈ {(kg/1000).toFixed(3)} t</span>
                             </>
                           );
                        })()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-[1.2rem] p-4 flex items-center justify-between shadow-inner">
                        <div>
                          <p className="text-[8px] text-slate-500 font-black uppercase mb-0.5">总投入成本</p>
                          <p className="text-xl font-black text-brand-primary tracking-tight">¥{((Number(totalCost) || 0) + (Number(shippingFee) || 0) + (Number(packagingFee) || 0)).toFixed(1)}</p>
                        </div>
                      </div>
                      <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-[1.2rem] p-4 flex items-center justify-between shadow-inner">
                        <div>
                          <p className="text-[8px] text-slate-500 font-black uppercase mb-0.5">单位成本 ({unitType})</p>
                          <p className="text-xl font-black text-brand-primary tracking-tight">¥{(Number(purchasePrice) || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="xl:col-span-3 space-y-4">
                  <p className="text-[11px] font-black text-amber-400 uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-5 h-5 rounded-lg bg-amber-400/20 flex items-center justify-center text-[10px]">3</span>
                    期望利润配置
                  </p>
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] space-y-6">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">设定售价 (元/{unitType})</label>
                      <input
                        type="number"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-6 text-amber-400 font-black text-3xl focus:outline-none focus:border-amber-400/50 transition-all shadow-inner"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                      {(['kg', 'jin', 'L'] as const).map((u) => (
                        <button
                          key={u}
                          onClick={() => handleUnitChange(u)}
                          className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all ${unitType === u ? 'bg-brand-primary text-white shadow-xl' : 'text-slate-600 hover:text-white'}`}
                        >
                          按{u === 'kg' ? '公斤' : u === 'jin' ? '斤' : '升'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profit Visualization Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <ProfitCard label="每升利润" value={results.profitL} purchase={results.purchaseL} sell={results.sellingL} />
                <ProfitCard label="每公斤利润" value={results.profitKg} purchase={results.purchaseKg} sell={results.sellingKg} />
                <ProfitCard label="每斤利润" value={results.profitJin} purchase={results.purchaseJin} sell={results.sellingJin} />
                
                <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group/margin">
                  <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover/margin:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10 text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4">综合毛利率</p>
                    <div className="relative inline-flex items-center justify-center">
                      <svg className="w-28 h-28 -rotate-90">
                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                        <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={314.16} strokeDashoffset={314.16 - (314.16 * (results.margin / 100))} className="text-brand-primary" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                      </svg>
                      <span className="absolute text-2xl font-black text-white">{results.margin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailInput = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white font-black text-base focus:outline-none focus:border-brand-primary/30 transition-all"
    />
  </div>
);

const ProfitCard = ({ label, value, purchase, sell }: any) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6 hover:bg-white/[0.04] transition-all group">
    <div className="flex justify-between items-center">
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">{label}</p>
      <div className={`px-3 py-1 rounded-full text-[9px] font-black ${value >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
        {value >= 0 ? '+' : ''}{value.toFixed(3)}
      </div>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[9px] text-slate-600 font-black uppercase">进货</p>
          <p className="text-xl font-black text-white">¥{purchase.toFixed(3)}</p>
        </div>
        <ArrowRightLeft size={16} className="text-slate-800 mb-1" />
        <div className="space-y-1 text-right">
          <p className="text-[9px] text-slate-600 font-black uppercase">预售</p>
          <p className="text-xl font-black text-amber-400">¥{sell.toFixed(3)}</p>
        </div>
      </div>
    </div>
  </div>
);
