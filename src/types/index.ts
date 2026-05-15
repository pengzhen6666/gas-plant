export type RecordType = '收入' | '支出' | '燃油采购' | '设备采购' | '销售录入';
export type SettlementType = '现结' | '月结' | '押一付一' | '挂账' | '其他';

export interface Transaction {
  id: string;
  date: string;
  type: RecordType;
  title: string;
  amount: number;
  quantity?: string;
  notes?: string;
  category?: string;
}

export interface Sale {
  id: string;
  customer_name: string;
  phone: string; 
  delivery_date: string;
  quantity: number;
  total_price: number;
  paid_amount: number;
  status: '已付款' | '未付款' | '部分付款';
  payment_date?: string | null;
  notes?: string;
  settlement_type?: SettlementType;
  assigned_equipment?: string;
}

export interface MerchantSummary {
  customer_name: string;
  phone: string;
  total_quantity: number;
  total_amount: number;
  total_paid: number;
  total_debt: number;
  records_count: number;
  settled_count: number;
  settlement_type?: SettlementType;
  assigned_equipment?: string;
  total_asset_value?: number;
}

export interface FuelQuote {
  id: string;
  date: string;
  factory_price: number;
  density: number;
  ton_barrel_price: number;
  total_cost?: number;
  total_qty?: number;
  batch_unit?: 'ton' | 'kg' | 'L';
  shipping_fee?: number;
  packaging_fee?: number;
  selling_price?: number;
  unit_type?: 'kg' | 'L' | 'jin';
  barrel_vol?: number;
  notes?: string;
}

export interface EquipmentType {
  id: string;
  name: string;
  price: number;
}

export interface PresetType {
  id: string;
  type: string;
  value: string;
  category?: string;
}
