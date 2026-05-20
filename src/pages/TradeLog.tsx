import { Edit2, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Trade, TradeResult, TradeStyle } from '../types';
import { formatCurrency, formatR } from '../utils/calculations';

interface TradeLogProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

export function TradeLog({ trades, onEdit, onDelete }: TradeLogProps) {
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState<TradeStyle | '全部'>('全部');
  const [result, setResult] = useState<TradeResult | '全部'>('全部');
  const [followed, setFollowed] = useState<'全部' | '是' | '否'>('全部');

  const filteredTrades = useMemo(() => {
    return trades
      .filter((trade) => trade.symbol.toLowerCase().includes(query.trim().toLowerCase()))
      .filter((trade) => (style === '全部' ? true : trade.style === style))
      .filter((trade) => (result === '全部' ? true : trade.result === result))
      .filter((trade) => (followed === '全部' ? true : trade.followedPlan === (followed === '是')))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [followed, query, result, style, trades]);

  return (
    <div className="grid gap-4">
      <div className="rounded border border-line bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              className="input pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索交易品种，例如 BTC / ETH / ONDO"
            />
          </label>
          <select className="input" value={style} onChange={(event) => setStyle(event.target.value as typeof style)}>
            <option>全部</option>
            <option>左侧</option>
            <option>右侧</option>
            <option>不确定</option>
          </select>
          <select className="input" value={result} onChange={(event) => setResult(event.target.value as typeof result)}>
            <option>全部</option>
            <option>盈利</option>
            <option>亏损</option>
            <option>保本</option>
          </select>
          <select
            className="input"
            value={followed}
            onChange={(event) => setFollowed(event.target.value as typeof followed)}
          >
            <option>全部</option>
            <option>是</option>
            <option>否</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1800px] table-fixed text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-muted">
              <tr>
                {[
                  '日期',
                  '交易品种',
                  '市场',
                  '方向',
                  '风格',
                  '级别',
                  '入场',
                  '出场',
                  '仓位',
                  '止损',
                  '止盈',
                  '盈亏',
                  'R',
                  '计划',
                  '结果',
                  '周期',
                  '入场理由',
                  '出场理由',
                  '情绪',
                  '错误标签',
                  '复盘总结',
                  '操作',
                ].map((header) => (
                  <th key={header} className="border-b border-line px-3 py-3">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => (
                <tr key={trade.id} className="align-top hover:bg-slate-50">
                  <td className="table-cell-compact">{trade.date}</td>
                  <td className="table-cell-compact font-semibold">{trade.symbol}</td>
                  <td className="table-cell-compact">{trade.marketType}</td>
                  <td className="table-cell-compact">{trade.direction}</td>
                  <td className="table-cell-compact">{trade.style}</td>
                  <td className="table-cell-compact">{trade.timeframe}</td>
                  <td className="table-cell-compact">{trade.entryPrice ?? '-'}</td>
                  <td className="table-cell-compact">{trade.exitPrice ?? '-'}</td>
                  <td className="table-cell-compact">{formatCurrency(trade.positionSize)}</td>
                  <td className="table-cell-compact">{trade.stopLossPrice ?? '-'}</td>
                  <td className="table-cell-compact">{trade.takeProfitTarget ?? '-'}</td>
                  <td
                    className={`table-cell-compact font-semibold ${
                      (trade.pnl ?? 0) >= 0 ? 'text-positive' : 'text-negative'
                    }`}
                  >
                    {formatCurrency(trade.pnl)}
                  </td>
                  <td className="table-cell-compact">{formatR(trade.rMultiple)}</td>
                  <td className="table-cell-compact">{trade.followedPlan ? '是' : '否'}</td>
                  <td className="table-cell-compact">{trade.result}</td>
                  <td className="table-cell-compact">{trade.holdingPeriod || '-'}</td>
                  <td className="table-cell-compact max-w-[220px]">{trade.entryReason || '-'}</td>
                  <td className="table-cell-compact max-w-[220px]">{trade.exitReason || '-'}</td>
                  <td className="table-cell-compact">{trade.emotion || '-'}</td>
                  <td className="table-cell-compact max-w-[220px]">{trade.errorTags.join('、') || '-'}</td>
                  <td className="table-cell-compact max-w-[260px]">{trade.review || '-'}</td>
                  <td className="table-cell-compact">
                    <div className="flex gap-2">
                      <button className="icon-btn" aria-label="编辑" title="编辑" onClick={() => onEdit(trade)}>
                        <Edit2 size={15} />
                      </button>
                      <button className="icon-btn-danger" aria-label="删除" title="删除" onClick={() => onDelete(trade.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredTrades.length && (
                <tr>
                  <td colSpan={22} className="px-4 py-10 text-center text-muted">
                    没有找到符合条件的交易记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
