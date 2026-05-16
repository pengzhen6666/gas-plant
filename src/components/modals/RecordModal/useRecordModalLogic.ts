import React, { useState, useEffect } from 'react';
import type { RecordType, SettlementType } from '../../../types/index';
import { jinToKg } from '../../../utils/index';
import { parseEquipName } from '../../../config/equipment';

interface Props {
  isOpen: boolean;
  editData: any;
  prefillData: any;
  onClose: () => void;
  onAddTransaction: (data: any) => void | Promise<void>;
  onAddSale: (data: any) => void | Promise<void>;
  onUpdateTransaction: (id: string, data: any) => void | Promise<void>;
  onUpdateSale: (id: string, data: any) => void | Promise<void>;
}

const parseBreakdown = (notes: string) => {
  if (!notes || !notes.includes('BREAKDOWN:')) return null;
  try {
    return JSON.parse(notes.split('BREAKDOWN:')[1]);
  } catch (e) {
    return null;
  }
};

export const useRecordModalLogic = ({ 
  isOpen, editData, prefillData, onClose, onAddTransaction, onAddSale, onUpdateTransaction, onUpdateSale 
}: Props) => {
  const [inputUnit, setInputUnit] = useState<'kg' | '斤' | 'L'>('kg');
  const [filterMfr, setFilterMfr] = useState<string | null>(null);
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

  const [purchaseDetails, setPurchaseDetails] = useState({
    oilBasePrice: '',
    barrelCost: '300',
    barrelCount: '0',
    density: '0.85',
    priceUnit: 'ton' as 'ton' | 'barrel',
    handlingRate: '0.3',
    taxRate: '1.0',
    handlingFeeFixed: '',
    taxFeeFixed: '',
    handlingFeeMode: 'percent' as 'percent' | 'fixed',
    taxFeeMode: 'percent' as 'percent' | 'fixed',
    shippingFee: '0',
    useHandlingFee: false,
    useTaxFee: false,
    isManualShipping: false,
    isAuto: false,
    distributeShipping: false
  });

  const [fuelPresets, setFuelPresets] = useState<{ name: string, density: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('fuel_presets');
      if (saved) {
        setFuelPresets(JSON.parse(saved));
      } else {
        setFuelPresets([
          { name: '宁煤液蜡2号', density: 0.778 },
          { name: '桉燃3号油', density: 0.771 },
          { name: '桉燃6号油', density: 0.93 }
        ]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.type === '燃油采购' && !formData.title && fuelPresets.length > 0) {
      const first = fuelPresets[0];
      setFormData(prev => ({ ...prev, title: first.name }));
      setPurchaseDetails(prev => ({ ...prev, density: first.density.toString() }));
    }
  }, [formData.type, formData.title, fuelPresets]);

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
          notes: (editData.notes || '').split('BREAKDOWN:')[0].trim(),
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
          notes: (editData.notes || '').split('BREAKDOWN:')[0].trim(),
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

        const bd = parseBreakdown(editData.notes || '');
        setPurchaseDetails({
          oilBasePrice: bd?.oilBasePrice || '',
          barrelCost: bd?.barrelCost || '300',
          barrelCount: bd?.barrelCount || '0',
          density: bd?.density || '0.85',
          priceUnit: bd?.priceUnit || 'ton',
          handlingRate: bd?.handlingRate || '0.3',
          taxRate: bd?.taxRate || '1.0',
          handlingFeeFixed: bd?.handlingFeeFixed || '',
          taxFeeFixed: bd?.taxFeeFixed || '',
          handlingFeeMode: bd?.handlingFeeMode || 'percent',
          taxFeeMode: bd?.taxFeeMode || 'percent',
          useHandlingFee: bd?.useHandlingFee || false,
          useTaxFee: bd?.useTaxFee || false,
          shippingFee: (editData.shipping_fee ?? bd?.shippingFee ?? '').toString(),
          distributeShipping: bd?.distributeShipping ?? true,
          isAuto: bd?.isAuto ?? true,
          isManualShipping: bd?.isManualShipping ?? false
        });
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
      setPurchaseDetails({
        oilBasePrice: '',
        barrelCost: '300',
        barrelCount: '0',
        density: '0.85',
        priceUnit: 'ton',
        handlingRate: '0.3',
        taxRate: '1.0',
        handlingFeeFixed: '',
        taxFeeFixed: '',
        handlingFeeMode: 'percent',
        taxFeeMode: 'percent',
        shippingFee: '0',
        useHandlingFee: false,
        useTaxFee: false,
        isManualShipping: false,
        isAuto: false,
        distributeShipping: false
      });
    }

    if (editData && editData.type === '燃油采购' && editData.notes?.includes('BREAKDOWN:')) {
      try {
        const jsonPart = editData.notes.split('BREAKDOWN:')[1];
        if (jsonPart) {
          const breakdown = JSON.parse(jsonPart);
          setPurchaseDetails({ 
            useHandlingFee: false, 
            useTaxFee: false, 
            density: '0.85',
            priceUnit: 'ton',
            ...breakdown, 
            isAuto: true 
          });
        }
      } catch (e) { console.error('Failed to parse breakdown', e); }
    }
  }, [editData, prefillData, isOpen]);

  useEffect(() => {
    if (formData.type === '燃油采购' && purchaseDetails.isAuto) {
      const density = parseFloat(purchaseDetails.density) || 0.85;
      const barrelCount = parseFloat(purchaseDetails.barrelCount) || 0;
      const weightKg = barrelCount * 1000 * density;
      const weightTon = weightKg / 1000;
      
      const basePrice = parseFloat(purchaseDetails.oilBasePrice) || 0;
      const barrelCost = parseFloat(purchaseDetails.barrelCost) || 0;
      const handlingRate = parseFloat(purchaseDetails.handlingRate) || 0;
      const taxRate = parseFloat(purchaseDetails.taxRate) || 0;
      
      // Calculate oil total based on price unit
      const oilTotal = purchaseDetails.priceUnit === 'barrel' 
        ? barrelCount * basePrice 
        : weightTon * basePrice;
        
      const barrelTotal = barrelCount * barrelCost;
      
      let handlingFee = 0;
      if (purchaseDetails.useHandlingFee) {
        if (purchaseDetails.handlingFeeMode === 'percent') {
          handlingFee = oilTotal * (handlingRate / 100);
        } else {
          handlingFee = parseFloat(purchaseDetails.handlingFeeFixed) || 0;
        }
      }

      let taxFee = 0;
      if (purchaseDetails.useTaxFee) {
        if (purchaseDetails.taxFeeMode === 'percent') {
          taxFee = oilTotal * (taxRate / 100);
        } else {
          taxFee = parseFloat(purchaseDetails.taxFeeFixed) || 0;
        }
      }
      
      const procurementTotal = oilTotal + barrelTotal + handlingFee + taxFee;
      
      let calculatedShipping = parseFloat(purchaseDetails.shippingFee) || 0;
      if (!purchaseDetails.isManualShipping) {
        calculatedShipping = 700;
        if (barrelCount > 1) {
          const perBarrel = formData.title.includes('宁煤') ? 600 : 610;
          calculatedShipping = barrelCount * perBarrel;
        }
        if (purchaseDetails.shippingFee !== calculatedShipping.toFixed(0)) {
          setPurchaseDetails(prev => ({ ...prev, shippingFee: calculatedShipping.toFixed(0) }));
        }
      }
      
      const newAmount = procurementTotal.toFixed(2).replace(/\.?0+$/, '');
      const newQty = weightKg.toFixed(0);
      const effectiveUP = weightKg > 0 ? (procurementTotal / weightKg).toFixed(2).replace(/\.?0+$/, '') : '';

      if (formData.amount !== newAmount || formData.quantity !== newQty || formData.unit_price !== effectiveUP) {
        setFormData(prev => ({ 
          ...prev, 
          quantity: newQty, 
          amount: newAmount,
          unit_price: effectiveUP
        }));
      }
    }
  }, [formData.type, purchaseDetails.isAuto, purchaseDetails.oilBasePrice, purchaseDetails.barrelCount, purchaseDetails.density, purchaseDetails.priceUnit, purchaseDetails.handlingRate, purchaseDetails.taxRate, purchaseDetails.handlingFeeFixed, purchaseDetails.taxFeeFixed, purchaseDetails.handlingFeeMode, purchaseDetails.taxFeeMode, purchaseDetails.useHandlingFee, purchaseDetails.useTaxFee, purchaseDetails.barrelCost, purchaseDetails.shippingFee, purchaseDetails.isManualShipping]);

  useEffect(() => {
    if (formData.type === '燃油采购' && purchaseDetails.isAuto) return;
    
    const up = parseFloat(formData.unit_price);
    const qty = parseFloat(formData.quantity);
    if (!isNaN(up) && !isNaN(qty) && up > 0 && qty > 0) {
      const totalNum = up * qty;
      const totalStr = totalNum.toFixed(2).replace(/\.?0+$/, '');
      
      if (formData.type === '销售录入') {
        if (formData.total_price !== totalStr) setFormData(prev => ({...prev, total_price: totalStr}));
      } else if (formData.type === '燃油采购') {
        if (formData.amount !== totalStr) setFormData(prev => ({...prev, amount: totalStr}));
      } else if (formData.type === '设备采购') {
        const total = totalNum.toFixed(2).replace(/\.?0+$/, '');
        if (formData.amount !== total) setFormData(prev => ({...prev, amount: total}));
      }
    } else if (formData.type === '设备采购' && !purchaseDetails.isAuto) {
       // Just handle amount based on unit price/qty
       const upNum = parseFloat(formData.unit_price) || 0;
       const qtyNum = parseFloat(formData.quantity) || 0;
       const total = (upNum * qtyNum).toFixed(2).replace(/\.?0+$/, '');
       if (formData.amount !== total) setFormData(prev => ({...prev, amount: total}));
    }
  }, [formData.unit_price, formData.quantity, formData.type, formData.total_price, formData.amount, purchaseDetails.isAuto, purchaseDetails.shippingFee, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === '销售录入' && formData.phone) {
      const phoneClean = formData.phone.replace(/\s/g, '');
      if (!/^\d{11}$/.test(phoneClean)) { alert('请输入正确的11位手机号码'); return; }
    }

    if (formData.type === '销售录入') {
      const totalPrice = Number(formData.total_price);
      const paidAmount = Number(formData.paid_amount);
      let status: '已付款' | '未付款' | '部分付款' = '未付款';
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
        status,
        payment_date: formData.payment_date || null,
        notes: formData.notes,
        settlement_type: formData.settlement_type,
        assigned_equipment: formData.assigned_equipment
      };
      if (editData && 'customer_name' in editData) onUpdateSale(editData.id, saleData);
      else onAddSale(saleData);
    } else {
      let finalNotes = formData.notes;
      if (formData.type === '燃油采购' && purchaseDetails.isAuto) {
        const currentPreset = fuelPresets.find(p => p.name === formData.title);
        const density = currentPreset?.density || 0.85;
        const breakdownStr = `BREAKDOWN:${JSON.stringify({ ...purchaseDetails, density, isAuto: undefined })}`;
        // Clean existing breakdown from notes if any, then append new one
        const cleanNotes = (formData.notes || '').split('BREAKDOWN:')[0].trim();
        finalNotes = cleanNotes ? `${cleanNotes}\n${breakdownStr}` : breakdownStr;
      } else if (formData.type === '设备采购' && parseFloat(purchaseDetails.shippingFee) > 0) {
        const breakdownStr = `BREAKDOWN:${JSON.stringify({ shippingFee: purchaseDetails.shippingFee, distributeShipping: purchaseDetails.distributeShipping })}`;
        const cleanNotes = (formData.notes || '').split('BREAKDOWN:')[0].trim();
        finalNotes = cleanNotes ? `${cleanNotes}\n${breakdownStr}` : breakdownStr;
      }
      const txData = {
        type: formData.type,
        title: formData.title,
        amount: Number(formData.amount),
        shipping_fee: (formData.type === '燃油采购' || formData.type === '设备采购') ? (Number(purchaseDetails.shippingFee) || 0) : 0,
        date: formData.date,
        quantity: formData.type === '燃油采购' ? `${formData.quantity}kg` : (formData.type === '设备采购' ? `${formData.quantity}个` : formData.quantity),
        notes: finalNotes,
        category: formData.type === '设备采购' ? formData.category : undefined
      };
      if (editData && !('customer_name' in editData)) onUpdateTransaction(editData.id, txData);
      else onAddTransaction(txData);
    }
    onClose();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, ''); 
    if (val.length <= 11) setFormData({...formData, phone: val});
  };

  const toggleUnit = () => {
    const units: ('kg' | '斤' | 'L')[] = ['kg', '斤', 'L'];
    const currentIndex = units.indexOf(inputUnit);
    const newUnit = units[(currentIndex + 1) % units.length];
    
    if (!formData.quantity && !formData.unit_price) { 
      setInputUnit(newUnit); 
      return; 
    }
    
    const density = parseFloat(purchaseDetails.density) || 0.85;
    
    setFormData(prev => {
      const updates: any = {};
      if (prev.quantity && prev.unit_price) {
        const q = parseFloat(prev.quantity);
        const p = parseFloat(prev.unit_price);
        
        // 1. First, convert current value back to KG base
        let baseQty = q;
        let basePrice = p;
        if (inputUnit === '斤') {
          baseQty = q / 2;
          basePrice = p * 2;
        } else if (inputUnit === 'L') {
          baseQty = q * density;
          basePrice = p / density;
        }
        
        // 2. Then, convert from KG base to the new unit
        if (newUnit === 'kg') {
          updates.quantity = baseQty.toFixed(2).replace(/\.?0+$/, '');
          updates.unit_price = basePrice.toFixed(2).replace(/\.?0+$/, '');
        } else if (newUnit === '斤') {
          updates.quantity = (baseQty * 2).toFixed(2).replace(/\.?0+$/, '');
          updates.unit_price = (basePrice / 2).toFixed(2).replace(/\.?0+$/, '');
        } else if (newUnit === 'L') {
          updates.quantity = (baseQty / density).toFixed(2).replace(/\.?0+$/, '');
          updates.unit_price = (basePrice * density).toFixed(2).replace(/\.?0+$/, '');
        }
      }
      return { ...prev, ...updates };
    });
    
    setInputUnit(newUnit);
  };

  return {
    formData, setFormData,
    purchaseDetails, setPurchaseDetails,
    fuelPresets, setFuelPresets,
    inputUnit, setInputUnit,
    filterMfr, setFilterMfr,
    handleSubmit,
    handlePhoneChange,
    toggleUnit,
    parseEquipName
  };
};
