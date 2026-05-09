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
