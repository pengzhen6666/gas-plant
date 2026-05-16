import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { FuelQuote } from '../../../types/index';
import { priceKgToL, priceLToKg, priceJinToKg, priceKgToJin } from '../../../utils';

export const useFuelCalculator = () => {
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
  const [quotes, setQuotes] = useState<FuelQuote[]>(() => {
    const cached = localStorage.getItem('fuel_quotes_cache');
    return cached ? JSON.parse(cached) : [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  const [fuelTypes, setFuelTypes] = useState<{ name: string, density: number }[]>(() => {
    const saved = localStorage.getItem('fuel_presets');
    return saved ? JSON.parse(saved) : [
      { name: '宁煤液蜡2号', density: 0.778 },
      { name: '桉燃3号油', density: 0.771 },
      { name: '桉燃6号油', density: 0.93 }
    ];
  });

  // Density Helper States
  const [helperKg, setHelperKg] = useState<string>('');
  const [helperL, setHelperL] = useState<string>('');

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
    totalProfit: 0,
    margin: 0
  });

  useEffect(() => {
    localStorage.setItem('fuel_presets', JSON.stringify(fuelTypes));
  }, [fuelTypes]);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    if (quotes.length === 0) setIsLoading(true);
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
      const fetchedData = data || [];
      setQuotes(fetchedData);
      localStorage.setItem('fuel_quotes_cache', JSON.stringify(fetchedData));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
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
      setIsModalOpen(false);
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
    } catch (e) {
      alert('删除失败');
    }
  };

  const applyHistoryRecord = (q: FuelQuote) => {
    setDensity(q.density?.toString() || '0.85');
    setFactoryQuote(q.factory_price?.toString() || '');
    setTotalCost(q.total_cost?.toString() || '');
    setTotalQty(q.total_qty?.toString() || '');
    setBatchUnit(q.batch_unit || 'ton');
    setShippingFee(q.shipping_fee?.toString() || '');
    setPackagingFee(q.packaging_fee?.toString() || '');
    setSellingPrice(q.selling_price?.toString() || '');
    setUnitType(q.unit_type || 'kg');
    setNotes(q.notes || '');
    setRecordDate(q.date || new Date().toISOString().split('T')[0]);
    setBarrelVol(q.barrel_vol?.toString() || '1000');
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

  const handleUnitChange = (newUnit: 'kg' | 'L' | 'jin') => {
    if (newUnit === unitType) return;
    const d = Number(density) || 0.85;
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

  // Unit Price Calculation
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

  // Results Calculation
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

    const qty = Number(totalQty) || 0;
    let qtyKg = 0;
    if (batchUnit === 'ton') qtyKg = qty * 1000;
    else if (batchUnit === 'kg') qtyKg = qty;
    else if (batchUnit === 'L') qtyKg = qty * d;

    const totalProfit = profitKg * qtyKg;

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
      totalProfit: totalProfit,
      margin: margin
    });
  }, [purchasePrice, sellingPrice, density, unitType, totalQty, batchUnit]);

  return {
    states: {
      purchasePrice, sellingPrice, density, unitType,
      totalCost, totalQty, batchUnit, shippingFee, packagingFee,
      factoryQuote, notes, recordDate, barrelVol, quotes,
      editingId, isSaving, isLoading, isModalOpen, filterCategory,
      fuelTypes, helperKg, helperL, results, currentBarrelPrice
    },
    actions: {
      setPurchasePrice, setSellingPrice, setDensity, setUnitType,
      setTotalCost, setTotalQty, setBatchUnit, setShippingFee, setPackagingFee,
      setFactoryQuote, setNotes, setRecordDate, setBarrelVol,
      setEditingId, setIsSaving, setIsLoading, setIsModalOpen, setFilterCategory,
      setFuelTypes, setHelperKg, setHelperL,
      saveQuote, deleteQuote, applyHistoryRecord, clearAll,
      applyTonBarrel, applyDensityHelper, handleUnitChange
    }
  };
};
