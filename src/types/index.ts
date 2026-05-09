export type RecordType = '收入' | '支出' | '燃油采购' | '设备采购' | '销售录入';
export type SettlementType = '现结' | '月结' | '押一付一' | '其他';

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
  payment_date?: string;
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
}
