import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Upload, FileSpreadsheet, Table2, ArrowRight, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Download, Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';

const BASE = '/api/v1';
function getToken() { return localStorage.getItem('access_token'); }

async function apiGet(path) {
  const res = await fetch(BASE + path, {
    headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiUpload(path, formData) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + getToken() },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

const STATUS_STYLES = {
  success: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  pending: 'bg-blue-100 text-blue-700',
};

export default function DataImport() {
  const toast = useToast() || { success: () => {}, error: () => {}, warning: () => {}, info: () => {} };
  const [tables, setTables] = useState([]);
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Import config
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [targetTable, setTargetTable] = useState('');
  const [mode, setMode] = useState('append');
  const [columnMapping, setColumnMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Drag state
  const [dragOver, setDragOver] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const t = await apiGet('/data-import/tables').catch(() => []);
      setTables(t || []);
    } catch (e) { console.error('tables:', e); }
    try {
      const h = await apiGet('/data-import/history').catch(() => []);
      setHistory(h || []);
    } catch (e) { console.error('history:', e); }
    try {
      const tp = await apiGet('/data-import/templates').catch(() => []);
      setTemplates(tp || []);
    } catch (e) { console.error('templates:', e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Upload file for preview
  const handleUpload = async (f) => {
    if (!f) return;
    setFile(f);
    setUploading(true);
    setPreview(null);
    setSelectedSheet(null);
    setTargetTable('');
    setColumnMapping({});
    try {
      const fd = new FormData();
      fd.append('file', f);
      const data = await apiUpload('/data-import/upload', fd);
      setPreview(data);
      if (data.sheets && data.sheets.length > 0) {
        setSelectedSheet(data.sheets[0]);
        // Auto-map columns by name match
        autoMapColumns(data.sheets[0]);
      }
      toast.success('Archivo cargado: ' + data.filename);
    } catch (err) {
      toast.error('Error al cargar: ' + err.message);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const autoMapColumns = (sheet) => {
    if (!targetTable || !sheet) return;
    const tbl = tables.find(t => t.name === targetTable);
    if (!tbl) return;
    const dbColNames = tbl.columns.map(c => c.name.toLowerCase());
    const map = {};
    sheet.columns.forEach(col => {
      const lower = col.toLowerCase().replace(/\s+/g, '_');
      if (dbColNames.includes(lower)) {
        map[col] = tbl.columns.find(c => c.name.toLowerCase() === lower).name;
      }
    });
    setColumnMapping(map);
  };

  // When target table changes, re-auto-map
  useEffect(() => {
    if (selectedSheet && targetTable) {
      autoMapColumns(selectedSheet);
    }
  }, [targetTable]);

  const handleSheetSelect = (sheetName) => {
    const sheet = preview.sheets.find(s => s.name === sheetName);
    setSelectedSheet(sheet);
    if (sheet && targetTable) autoMapColumns(sheet);
  };

  const handleMappingChange = (excelCol, dbCol) => {
    setColumnMapping(prev => {
      const next = { ...prev };
      if (dbCol === '') {
        delete next[excelCol];
      } else {
        next[excelCol] = dbCol;
      }
      return next;
    });
  };

  const handleExecuteImport = async () => {
    if (!file || !targetTable || !selectedSheet) {
      toast.error('Selecciona archivo, hoja y tabla destino');
      return;
    }
    if (Object.keys(columnMapping).length === 0) {
      toast.error('Mapea al menos una columna');
      return;
    }

    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('table_name', targetTable);
      fd.append('mode', mode);
      fd.append('sheet_name', selectedSheet.name);
      fd.append('column_mapping', JSON.stringify(columnMapping));
      const result = await apiUpload('/data-import/execute', fd);
      toast.success('Importados ' + result.rows_imported + ' registros en ' + result.table_name);
      if (result.errors && result.errors.length > 0) {
        toast.error('Errores: ' + result.errors.length);
      }
      // Reset and reload
      setFile(null);
      setPreview(null);
      setSelectedSheet(null);
      setTargetTable('');
      setColumnMapping({});
      loadData();
    } catch (err) {
      toast.error('Error de importacion: ' + err.message);
    } finally {
      setImporting(false);
    }
  };


  const handleAiAnalyze = async () => {
    if (!preview || !selectedSheet) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const payload = {
        columns: selectedSheet.columns,
        sample_rows: selectedSheet.preview_rows,
        tables: tables.map(t => ({ name: t.name, columns: t.columns })),
        filename: file ? file.name : '',
      };
      const res = await fetch(BASE + '/data-import/ai-analyze', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      setAiResult(result);
      // Auto-apply suggestions
      if (result.suggested_table) {
        setTargetTable(result.suggested_table);
      }
      if (result.column_mapping && Object.keys(result.column_mapping).length > 0) {
        setColumnMapping(result.column_mapping);
      }
      toast.success('AI analysis complete — ' + (result.confidence || 0) + '% confidence');
    } catch (err) {
      toast.error('AI analysis failed: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleUpload(f);
  };

  const handleFileInput = (e) => {
    const f = e.target.files[0];
    if (f) handleUpload(f);
  };

  const targetTableCols = targetTable ? (tables.find(t => t.name === targetTable)?.columns || []) : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Import</h1>
          <p className="text-sm text-gray-500 mt-1">Importar datos desde archivos Excel/CSV a la base de datos</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Upload Area */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          1. Cargar Archivo
        </h2>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragOver ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400'
          }`}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input id="file-input" type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFileInput} />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Procesando archivo...</span>
            </div>
          ) : file ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <FileSpreadsheet className="w-6 h-6" />
              <span className="font-medium">{file.name}</span>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-gray-500">
              <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-medium">Arrastra un archivo aqui o haz clic para seleccionar</p>
              <p className="text-xs mt-1">Formatos: .xlsx, .csv</p>
            </div>
          )}
        </div>
      </Card>

      {/* Preview + Configuration */}
      {preview && selectedSheet && (
        <>
          {/* Sheet Selector */}
          {preview.sheets.length > 1 && (
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-2">Seleccionar Hoja</h3>
              <div className="flex gap-2 flex-wrap">
                {preview.sheets.map(s => (
                  <Button
                    key={s.name}
                    variant={selectedSheet.name === s.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSheetSelect(s.name)}
                  >
                    {s.name} ({s.row_count} filas)
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Preview Table */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Table2 className="w-5 h-5" />
              2. Vista Previa — {selectedSheet.name} ({selectedSheet.row_count} filas)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    {selectedSheet.columns.map(col => (
                      <th key={col} className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 border-b whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedSheet.preview_rows.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      {selectedSheet.columns.map(col => (
                        <td key={col} className="px-3 py-1.5 text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-[200px] truncate">
                          {row[col] != null ? String(row[col]) : <span className="text-gray-400 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Import Configuration */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              3. Configurar Importacion
            </h2>

            {/* AI Auto-Configure */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300">AI Auto-Configure</h3>
                  <p className="text-xs text-purple-500 mt-0.5">AI analyzes your file and suggests the best table + column mapping</p>
                </div>
                <button
                  onClick={handleAiAnalyze}
                  disabled={aiLoading || !selectedSheet || tables.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
                >
                  {aiLoading ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <>AI Auto-Configure</>
                  )}
                </button>
              </div>
              {aiResult && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Suggested:</span>
                    <span className="font-mono text-sm text-purple-700 dark:text-purple-300">{aiResult.suggested_table}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      aiResult.confidence >= 80 ? 'bg-green-100 text-green-700' :
                      aiResult.confidence >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{aiResult.confidence}%</span>
                    {aiResult.alternatives && aiResult.alternatives.length > 0 && (
                      <span className="text-xs text-gray-500">
                        Alt: {aiResult.alternatives.map(a => a.table + ' ' + a.confidence + '%').join(', ')}
                      </span>
                    )}
                  </div>
                  {aiResult.warnings && aiResult.warnings.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded p-2">
                      <p className="text-xs font-semibold text-yellow-700 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Warnings</p>
                      <ul className="text-xs text-yellow-600 space-y-0.5">
                        {aiResult.warnings.map((w, i) => <li key={i}>- {w}</li>)}
                      </ul>
                    </div>
                  )}
                  {aiResult.create_table_sql && (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-2">
                      <p className="text-xs font-semibold mb-1">Suggested new table:</p>
                      <pre className="text-xs overflow-x-auto">{aiResult.create_table_sql}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Target Table */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tabla Destino</label>
                <select
                  value={targetTable}
                  onChange={(e) => setTargetTable(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="">-- Seleccionar tabla --</option>
                  {tables.map(t => (
                    <option key={t.name} value={t.name}>{t.name} ({t.row_count} registros)</option>
                  ))}
                </select>
              </div>

              {/* Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modo</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mode" value="append" checked={mode === 'append'} onChange={() => setMode('append')} className="accent-emerald-600" />
                    <span className="text-sm">Agregar (append)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="mode" value="replace" checked={mode === 'replace'} onChange={() => setMode('replace')} className="accent-red-600" />
                    <span className="text-sm text-red-600 font-medium">Reemplazar (borrar todo)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Column Mapping */}
            {targetTable && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Mapeo de Columnas</h3>
                <p className="text-xs text-gray-500 mb-3">Selecciona la columna de la base de datos para cada columna del archivo</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {selectedSheet.columns.map(excelCol => (
                    <div key={excelCol} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                      <span className="text-sm font-mono text-emerald-700 dark:text-emerald-400 truncate flex-shrink-0 max-w-[120px]" title={excelCol}>
                        {excelCol}
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <select
                        value={columnMapping[excelCol] || ''}
                        onChange={(e) => handleMappingChange(excelCol, e.target.value)}
                        className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-xs min-w-0"
                      >
                        <option value="">-- ignorar --</option>
                        {targetTableCols.map(c => (
                          <option key={c.name} value={c.name}>
                            {c.name} ({c.type}){c.pk ? ' PK' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Import Button */}
            <div className="mt-6 flex items-center gap-4">
              <Button
                onClick={handleExecuteImport}
                disabled={importing || !targetTable || Object.keys(columnMapping).length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {importing ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Importando...</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" /> Ejecutar Importacion</>
                )}
              </Button>
              <span className="text-xs text-gray-500">
                {Object.keys(columnMapping).length} columnas mapeadas
                {mode === 'replace' && <span className="text-red-500 font-medium ml-2">REEMPLAZAR: se borraran todos los datos existentes</span>}
              </span>
            </div>
          </Card>
        </>
      )}

      {/* Templates (seed_data) */}
      {templates.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Plantillas Disponibles (seed_data)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {templates.map(t => (
              <div key={t.filename} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                <span className="text-sm truncate mr-2">{t.filename}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{t.size_kb} KB</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Import History */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3">Historial de Importaciones</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No hay importaciones registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-3 py-2 text-left font-medium">Fecha</th>
                  <th className="px-3 py-2 text-left font-medium">Archivo</th>
                  <th className="px-3 py-2 text-left font-medium">Tabla</th>
                  <th className="px-3 py-2 text-left font-medium">Modo</th>
                  <th className="px-3 py-2 text-left font-medium">Filas</th>
                  <th className="px-3 py-2 text-left font-medium">Estado</th>
                  <th className="px-3 py-2 text-left font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.import_id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-3 py-1.5 whitespace-nowrap">{h.created_at ? new Date(h.created_at).toLocaleString() : '-'}</td>
                    <td className="px-3 py-1.5 max-w-[200px] truncate" title={h.filename}>{h.filename}</td>
                    <td className="px-3 py-1.5 font-mono text-xs">{h.table_name}</td>
                    <td className="px-3 py-1.5">
                      <Badge className={h.mode === 'replace' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                        {h.mode}
                      </Badge>
                    </td>
                    <td className="px-3 py-1.5 font-mono">{h.rows_imported}</td>
                    <td className="px-3 py-1.5">
                      <Badge className={STATUS_STYLES[h.status] || 'bg-gray-100 text-gray-700'}>
                        {h.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-1.5 text-xs text-red-500 max-w-[200px] truncate" title={h.error_message || ''}>
                      {h.error_message || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* DB Tables Overview */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Table2 className="w-5 h-5" />
          Tablas en la Base de Datos ({tables.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {tables.map(t => (
            <div key={t.name} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
              <span className="text-sm font-mono truncate mr-2">{t.name}</span>
              <Badge variant="secondary" className="text-xs">{t.row_count}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
