import xlsx from 'xlsx';
import path from 'path';

const files = [
  '4月支出.xlsx',
  '5月支出购销.xlsx',
  '商家设备清单.xlsx',
  '燃油购买清单.xlsx'
];

files.forEach(file => {
  try {
    const filePath = path.resolve(file);
    console.log(`\n=================== FILE: ${file} ===================`);
    const workbook = xlsx.readFile(filePath);
    
    workbook.SheetNames.forEach(sheetName => {
      console.log(`--- Sheet: ${sheetName} ---`);
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
      console.log(`Total Rows: ${data.length}`);
      if (data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('First 5 Rows:');
        console.log(JSON.stringify(data.slice(0, 5), null, 2));
      } else {
        console.log('Empty sheet');
      }
    });
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
  }
});
