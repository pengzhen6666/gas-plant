import React, { useState, useEffect } from 'react';
import type { RecordType, SettlementType } from '../../../types/index';
import { jinToKg } from '../../../utils/index';

interface Props {
  isOpen: boolean;
  editData: any;
  prefillData: any;
  onClose: () => void;
  onAddTransaction: (data: any) => void;
  onAddSale: (data: any) => void;
  onUpdateTransaction: (id: string, data: any) => void;
  onUpdateSale: (id: string, data: any) => void;
}

export const useRecordModalLogic = ({ 
  isOpen, editData, prefillData, onClose, onAddTransaction, onAddSale, onUpdateTransaction, onUpdateSale 
}: Props) => {
  const [inputUnit, setInputUnit] = useState<'kg' | '斤'>('kg');
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
    handlingRate: '0.3',
    taxRate: '1.0',
    shippingFee: '700',
    isAuto: false
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
      setFormData(prev => ({ ...prev, title: fuelPresets[0].name }));
    }
  }, [formData.type, fuelPresets]);

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
      setPurchaseDetails({
        oilBasePrice: '',
        barrelCost: '300',
        barrelCount: '0',
        handlingRate: '0.3',
        taxRate: '1.0',
        shippingFee: '700',
        isAuto: false
      });
    }

    if (editData && editData.type === '燃油采购' && editData.notes?.includes('BREAKDOWN:')) {
      try {
        const jsonPart = editData.notes.split('BREAKDOWN:')[1];
        if (jsonPart) {
          const breakdown = JSON.parse(jsonPart);
          setPurchaseDetails({ ...breakdown, isAuto: true });
        }
      } catch (e) { console.error('Failed to parse breakdown', e); }
    }
  }, [editData, prefillData, isOpen]);

  useEffect(() => {
    if (formData.type === '燃油采购' && purchaseDetails.isAuto) {
      const currentPreset = fuelPresets.find(p => p.name === formData.title);
      const density = currentPreset?.density || 0.85;
      const barrelCount = parseFloat(purchaseDetails.barrelCount) || 0;
      const weightKg = barrelCount * 1000 * density;
      const weightTon = weightKg / 1000;
      const basePrice = parseFloat(purchaseDetails.oilBasePrice) || 0;
      const barrelCost = parseFloat(purchaseDetails.barrelCost) || 0;
      const handlingRate = parseFloat(purchaseDetails.handlingRate) || 0;
      const taxRate = parseFloat(purchaseDetails.taxRate) || 0;
      const oilTotal = weightTon * basePrice;
      const barrelTotal = barrelCount * barrelCost;
      const handlingFee = oilTotal * (handlingRate / 100);
      const taxFee = oilTotal * (taxRate / 100);
      let calculatedShipping = 700;
      if (weightTon > 1) {
        const perTon = formData.title.includes('宁煤') ? 600 : 610;
        calculatedShipping = weightTon * perTon;
      }
      setPurchaseDetails(prev => ({ ...prev, shippingFee: calculatedShipping.toFixed(0) }));
      const total = oilTotal + barrelTotal + handlingFee + taxFee + calculatedShipping;
      setFormData(prev => ({ ...prev, quantity: weightKg.toFixed(0), amount: total.toFixed(0) }));
    }
  }, [formData.title, purchaseDetails.isAuto, purchaseDetails.oilBasePrice, purchaseDetails.barrelCost, purchaseDetails.barrelCount, purchaseDetails.handlingRate, purchaseDetails.taxRate, fuelPresets]);

  useEffect(() => {
    if (!isOpen) return;
    const up = parseFloat(formData.unit_price);
    const qty = parseFloat(formData.quantity);
    if (!isNaN(up) && !isNaN(qty) && up > 0 && qty > 0) {
      const total = (up * qty).toFixed(2).replace(/\.?0+$/, '');
      if (formData.type === '销售录入') {
        if (formData.total_price !== total) setFormData(prev => ({...prev, total_price: total}));
      } else if (formData.type === '燃油采购' || formData.type === '设备采购') {
        if (formData.amount !== total) setFormData(prev => ({...prev, amount: total}));
      }
    }
  }, [formData.unit_price, formData.quantity, formData.type, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === '销售录入' && formData.phone) {
      const phoneClean = formData.phone.replace(/\s/g, '');
      if (!/^\d{11}$/.test(phoneClean)) { alert('请输入正确的11位手机号码'); return; }
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
        finalNotes = finalNotes ? `${finalNotes}\n${breakdownStr}` : breakdownStr;
      }
      const txData = {
        type: formData.type,
        title: formData.title,
        amount: Number(formData.amount),
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
    if (!formData.quantity) { setInputUnit(inputUnit === 'kg' ? '斤' : 'kg'); return; }
    if (inputUnit === 'kg') {
      setFormData({...formData, quantity: (Number(formData.quantity) * 2).toFixed(2).replace(/\.?0+$/, '')});
      setInputUnit('斤');
    } else {
      setFormData({...formData, quantity: (Number(formData.quantity) / 2).toFixed(2).replace(/\.?0+$/, '')});
      setInputUnit('kg');
    }
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
    parseEquipName: (fullName: string) => {
      const parts = fullName.split('::');
      if (parts.length === 3) return { cat: parts[0], mfr: parts[1], model: parts[2] };
      return { cat: '', mfr: '', model: fullName };
    }
  };
};
