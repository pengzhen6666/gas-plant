export const STOVE_TYPES = ['两炒一温', '两炒两温', '单炒单温', '大锅灶', '低汤炉', '单眼低汤炉', '双眼低汤炉', '猛火灶', '蒸包炉', '煮面桶', '其他型号'];
export const STOVE_DIMENSIONS = ['1500*800*800', '1500*900*800', '1800*900*800', '1500*950*800', '1800*950*800', '600*600*750', '1200*800*650'];
export const STOVE_BURNERS = ['常规', '战狼', 'D4', 'K2', '电气化', '双眼电气化'];
export const STOVE_BASINS = ['28', '31', '35', '38', '40', '50#', '60#'];
export const STOVE_MANUFACTURERS = ['山东凯佳', '湖北均辉', '佛山桉燃', '山东德旺', '广东恒联', '厨具通', '其他厂家'];
export const CATEGORIES = ['炉灶', '油箱', '煲仔炉', '汤炉', '蒸柜', '运费', '其他配件'];

/**
 * Parses the structured equipment name string into its components.
 * Format: Category::Manufacturer::Model/Spec1/Spec2...
 */
export const parseEquipName = (rawName: string) => {
  const parts = rawName.split('::');
  if (parts.length === 3) {
    return { 
      category: parts[0], 
      manufacturer: parts[1], 
      itemName: parts[2],
      mfr: parts[1], // Alias for convenience
      model: parts[2] // Alias for convenience
    };
  }
  return { 
    category: '其他配件', 
    manufacturer: '通用', 
    itemName: rawName,
    mfr: '通用',
    model: rawName
  };
};
