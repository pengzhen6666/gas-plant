export const EQUIPMENT_MODELS: Record<string, string[]> = {
  '炉灶': ['两炒一温', '两炒两温', '单炒单温', '大锅灶', '猛火灶', '其他型号'],
  '汤炉': ['低汤炉', '单眼低汤炉', '双眼低汤炉', '煮面桶', '其他型号'],
  '油箱': ['500*800*800', '600*800*800', '400*800*800', '500*1000*800', '其他型号'],
  '煲仔炉': ['二眼煲仔炉', '四眼煲仔炉', '六眼煲仔炉', '八眼煲仔炉', '其他型号'],
  '蒸柜': ['蒸包炉', '单门蒸柜', '双门蒸柜', '三门蒸柜', '其他型号'],
  '其他配件': ['减压阀', '连接管', '三通', '点火枪', '其他型号']
};

export const ALL_MODELS = Object.values(EQUIPMENT_MODELS).flat();

export const STOVE_DIMENSIONS = ['1500*800*800', '1500*900*800', '1800*900*800', '1500*950*800', '1800*950*800', '600*600*750', '1200*800*650', '其他尺寸'];
export const STOVE_BURNERS = ['常规', '战狼', 'D4', 'K2', '电气化', '双眼电气化', '其他炉头'];
export const STOVE_BASINS = ['28', '31', '35', '38', '40', '50#', '60#'];
export const STOVE_MANUFACTURERS = ['山东凯佳', '湖北均辉', '佛山桉燃', '山东德旺', '广东恒联', '厨具通', '其他厂家'];
export const CATEGORIES = ['炉灶', '油箱', '煲仔炉', '汤炉', '蒸柜', '其他配件'];

/**
 * Parses the structured equipment name string into its components.
 */
export const parseEquipName = (rawName: string) => {
  const parts = rawName.includes('::') ? rawName.split('::') : rawName.split(':');
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
