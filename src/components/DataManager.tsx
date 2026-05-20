import { Download, FileDown, FileUp, Trash2, Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { Trade } from '../types';
import { csvToTrades, downloadTextFile, parseJsonTrades, tradesToCsv } from '../utils/importExport';

interface DataManagerProps {
  trades: Trade[];
  onReplaceTrades: (trades: Trade[]) => void;
}

export function DataManager({ trades, onReplaceTrades }: DataManagerProps) {
  const dateText = new Date().toISOString().slice(0, 10);

  const handleCsvImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const imported = csvToTrades(text);
    onReplaceTrades([...imported, ...trades]);
    event.target.value = '';
  };

  const handleJsonImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseJsonTrades(text);
      onReplaceTrades(imported);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'JSON 恢复失败');
    }
    event.target.value = '';
  };

  const handleClear = () => {
    const first = window.confirm('确认清空全部交易数据吗？请先下载 JSON 备份。');
    if (!first) return;
    const second = window.confirm('再次确认：清空后无法撤销。是否继续？');
    if (!second) return;
    onReplaceTrades([]);
  };

  return (
    <div className="mt-4 border-t border-line pt-4">
      <p className="mb-2 px-2 text-xs font-semibold text-muted">数据管理</p>
      <div className="grid gap-2">
        <button
          className="btn-secondary justify-start"
          onClick={() => downloadTextFile(`交易记录-${dateText}.csv`, tradesToCsv(trades), 'text/csv;charset=utf-8')}
        >
          <FileDown size={16} />
          导出 CSV
        </button>
        <label className="btn-secondary cursor-pointer justify-start">
          <FileUp size={16} />
          导入 CSV
          <input className="hidden" type="file" accept=".csv,text/csv" onChange={handleCsvImport} />
        </label>
        <button
          className="btn-secondary justify-start"
          onClick={() =>
            downloadTextFile(
              `交易复盘备份-${dateText}.json`,
              JSON.stringify(trades, null, 2),
              'application/json;charset=utf-8',
            )
          }
        >
          <Download size={16} />
          下载 JSON 备份
        </button>
        <label className="btn-secondary cursor-pointer justify-start">
          <Upload size={16} />
          从 JSON 恢复
          <input className="hidden" type="file" accept=".json,application/json" onChange={handleJsonImport} />
        </label>
        <button className="btn-danger justify-start" onClick={handleClear}>
          <Trash2 size={16} />
          清空全部数据
        </button>
      </div>
    </div>
  );
}
