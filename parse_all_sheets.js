import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const files = [
  '4月支出.xlsx',
  '5月支出购销.xlsx',
  '商家设备清单.xlsx',
  '燃油购买清单.xlsx'
];

let mdContent = `# Excel Files Analysis Report\n\nThis report presents the structures and data found in the four Excel files under the workspace.\n\n`;

files.forEach(file => {
  try {
    const filePath = path.resolve(file);
    mdContent += `## File: ${file}\n\n`;
    const workbook = xlsx.readFile(filePath);
    
    workbook.SheetNames.forEach(sheetName => {
      mdContent += `### Sheet: ${sheetName}\n\n`;
      const sheet = workbook.Sheets[sheetName];
      // Convert sheet to a grid of arrays (preserving empty rows) to format it properly
      const range = xlsx.utils.decode_range(sheet['!ref'] || 'A1:A1');
      const maxCol = range.e.c;
      const maxRow = range.e.r;
      
      mdContent += `**Range**: ${sheet['!ref'] || 'Empty'}\n\n`;
      
      // Let's output it as a markdown table.
      // We will first read sheet as json with headers: 1 to get a grid of rows
      const grid = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      if (grid.length === 0) {
        mdContent += `*Empty Sheet*\n\n`;
        return;
      }
      
      // Print first 50 rows of each sheet to avoid blowing up the file size, or print all if smaller
      const rowsToPrint = grid.slice(0, 100);
      
      // Find the maximum columns in these rows to generate table headers
      let numCols = 0;
      rowsToPrint.forEach(r => {
        if (Array.isArray(r) && r.length > numCols) {
          numCols = r.length;
        }
      });
      
      if (numCols === 0) {
        mdContent += `*Empty Rows*\n\n`;
        return;
      }
      
      // Generate headers
      let headerRow = '|';
      let separatorRow = '|';
      for (let i = 0; i < numCols; i++) {
        headerRow += ` Col ${i + 1} |`;
        separatorRow += ` --- |`;
      }
      mdContent += headerRow + '\n' + separatorRow + '\n';
      
      rowsToPrint.forEach(row => {
        let rowStr = '|';
        for (let i = 0; i < numCols; i++) {
          const val = row[i] !== undefined && row[i] !== null ? String(row[i]).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|') : '';
          rowStr += ` ${val} |`;
        }
        mdContent += rowStr + '\n';
      });
      
      if (grid.length > 100) {
        mdContent += `\n*... showing 100 of ${grid.length} rows ...*\n\n`;
      }
      mdContent += '\n';
    });
  } catch (error) {
    mdContent += `*Error reading file ${file}: ${error.message}*\n\n`;
  }
});

// Create artifact directory if it doesn't exist (although write_to_file will auto create if IsArtifact is true)
// Wait, we can write directly to an artifact
fs.writeFileSync('excel_contents.md', mdContent);
console.log('Successfully generated excel_contents.md');
