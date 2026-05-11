export const kgToJin = (kg: number | string) => {
  const val = Number(kg);
  return isNaN(val) ? 0 : Number((val * 2).toFixed(2));
};

export const jinToKg = (jin: number | string) => {
  const val = Number(jin);
  return isNaN(val) ? 0 : Number((val / 2).toFixed(2));
};

export const formatQty = (qty: string | undefined) => {
  if (!qty) return '-';
  // Clean up legacy "个/台" strings from DB
  return qty.replace('个/台', '个');
};

export const priceKgToL = (pricePerKg: number, density: number) => {
  return Number((pricePerKg * density).toFixed(3));
};

export const priceLToKg = (pricePerL: number, density: number) => {
  return Number((pricePerL / density).toFixed(3));
};

// Price conversions
export const priceJinToKg = (pricePerJin: number) => {
  return pricePerJin * 2;
};

export const priceKgToJin = (pricePerKg: number) => {
  return pricePerKg / 2;
};


