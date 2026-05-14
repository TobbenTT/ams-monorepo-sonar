import { saveAs } from 'file-saver';

/**
 * Takes the export JSON from the backend and generates a real downloadable file.
 * Backend returns: { format, sheets: [{ name, headers, rows }], metadata }
 *
 * Dynamic imports for xlsx (~277KB): only downloaded when the user actually exports.
 * Keeps it out of the initial bundle.
 */
export async function downloadExport(data, filename) {
  const format = (data.format || 'EXCEL').toUpperCase();
  if (format === 'CSV') return downloadCSV(data, filename);
  return downloadXLSX(data, filename);
}

async function downloadXLSX(data, filename) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const sheets = data.sheets || [];

  if (sheets.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([['No data available']]);
    XLSX.utils.book_append_sheet(wb, ws, 'Export');
  } else {
    for (const sheet of sheets) {
      const rows = [];
      if (sheet.headers) rows.push(sheet.headers);
      if (sheet.rows) {
        for (const row of sheet.rows) {
          rows.push(Array.isArray(row) ? row : Object.values(row));
        }
      }
      const ws = XLSX.utils.aoa_to_sheet(rows);
      if (rows.length > 0) {
        ws['!cols'] = rows[0].map((_, ci) => ({
          wch: Math.min(40, Math.max(12, ...rows.map(r => String(r[ci] ?? '').length)))
        }));
      }
      const name = (sheet.name || `Sheet${sheets.indexOf(sheet) + 1}`).substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, name);
    }
  }

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fname = (filename || `export_${new Date().toISOString().slice(0, 10)}`).replace(/\.xlsx$/, '') + '.xlsx';
  saveAs(blob, fname);
}

function downloadCSV(data, filename) {
  const sheets = data.sheets || [];
  let csvContent = '';
  for (const sheet of sheets) {
    if (sheets.length > 1) csvContent += `--- ${sheet.name || 'Sheet'} ---\n`;
    if (sheet.headers) csvContent += sheet.headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\n';
    if (sheet.rows) {
      for (const row of sheet.rows) {
        const cells = Array.isArray(row) ? row : Object.values(row);
        csvContent += cells.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
      }
    }
    csvContent += '\n';
  }
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
  const fname = (filename || `export_${new Date().toISOString().slice(0, 10)}`).replace(/\.csv$/, '') + '.csv';
  saveAs(blob, fname);
}
