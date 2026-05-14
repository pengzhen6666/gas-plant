import React from 'react';
import { X, Loader2 } from 'lucide-react';
import type { RecordType } from '../../types/index';

// Sub-components
import { FuelPurchaseSection } from './RecordModal/FuelPurchaseSection';
import { EquipmentPurchaseSection } from './RecordModal/EquipmentPurchaseSection';
import { SalesEntrySection } from './RecordModal/SalesEntrySection';
import { CommonFields } from './RecordModal/CommonFields';
import { useRecordModalLogic } from './RecordModal/useRecordModalLogic';

export const RecordModal = ({ 
  isOpen, onClose, onAddTransaction, onAddSale, onUpdateTransaction, onUpdateSale, 
  isSubmitting, editData, prefillData, equipmentCatalog 
}: any) => {
  const {
    formData, setFormData,
    purchaseDetails, setPurchaseDetails,
    fuelPresets, setFuelPresets,
    inputUnit, toggleUnit,
    filterMfr, setFilterMfr,
    handleSubmit, handlePhoneChange, parseEquipName
  } = useRecordModalLogic({
    isOpen, editData, prefillData, onClose, 
    onAddTransaction, onAddSale, onUpdateTransaction, onUpdateSale
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] p-4">
      <div className="glass-card w-full max-w-lg p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editData ? '编辑记录' : (prefillData ? '老客户续订' : '新增记录')}
          </h2>
          <X size={24} onClick={onClose} className="cursor-pointer text-slate-400 hover:text-white transition-colors" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selector */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">记录类型</label>
            <select 
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white font-bold"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as RecordType})}
              disabled={isSubmitting || !!editData || !!prefillData}
            >
              <option value="收入">日常收入 (➕)</option>
              <option value="支出">日常支出 (➖)</option>
              <option value="燃油采购">燃油进货 (采购)</option>
              <option value="设备采购">设备采购 (资产库)</option>
              <option value="销售录入">销售开单 (商家订单)</option>
            </select>
          </div>

          {/* Dynamic Sections */}
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {formData.type === '销售录入' && (
              <SalesEntrySection 
                formData={formData} setFormData={setFormData}
                equipmentCatalog={equipmentCatalog}
                filterMfr={filterMfr} setFilterMfr={setFilterMfr}
                parseEquipName={parseEquipName}
                handlePhoneChange={handlePhoneChange}
              />
            )}

            {formData.type === '燃油采购' && (
              <FuelPurchaseSection 
                formData={formData} setFormData={setFormData}
                purchaseDetails={purchaseDetails} setPurchaseDetails={setPurchaseDetails}
                fuelPresets={fuelPresets} setFuelPresets={setFuelPresets}
              />
            )}

            {formData.type === '设备采购' && (
              <EquipmentPurchaseSection 
                formData={formData} setFormData={setFormData}
                equipmentCatalog={equipmentCatalog}
                parseEquipName={parseEquipName}
              />
            )}

            {(formData.type === '收入' || formData.type === '支出') && (
              <div className="space-y-2">
                <label className="text-sm text-slate-400">摘要内容</label>
                <input 
                  type="text" 
                  className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
                  placeholder="如: 办公室租金, 维修费"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
            )}

            {/* Common Fields (Amount, Qty, Note) */}
            <CommonFields 
              formData={formData} setFormData={setFormData}
              inputUnit={inputUnit} toggleUnit={toggleUnit}
              purchaseDetails={purchaseDetails}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">备注说明 (可选)</label>
            <textarea 
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white min-h-[80px] resize-none"
              placeholder="记录一些细节..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              disabled={isSubmitting}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full justify-center py-4 text-lg font-black tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>处理中...</span>
              </div>
            ) : (
              <span>{editData ? '保存修改' : '确认录入'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
