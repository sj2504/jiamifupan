import type { Trade } from '../types';
import { calculateTrade, safeNumber } from './calculations';

const csvHeaders = [
  '日期',
  '交易品种',
  '市场类型',
  '方向',
  '交易风格',
  '时间级别',
  '入场价格',
  '出场价格',
  '仓位金额 USDT',
  '止损价格',
  '止盈目标',
  '实际盈亏 USDT',
  '盈亏百分比',
  'R 倍数',
  '风险回报比',
  '是否遵守计划',
  '交易结果',
  '持仓周期',
  '入场理由',
  '出场理由',
  '当时市场环境',
  '情绪状态',
  '错误标签',
  '复盘总结',
] as const;

const escapeCsvValue = (value: unknown) => {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export const tradesToCsv = (trades: Trade[]) => {
  const rows = trades.map((trade) => [
    trade.date,
    trade.symbol,
    trade.marketType,
    trade.direction,
    trade.style,
    trade.timeframe,
    trade.entryPrice ?? '',
    trade.exitPrice ?? '',
    trade.positionSize ?? '',
    trade.stopLossPrice ?? '',
    trade.takeProfitTarget ?? '',
    trade.pnl ?? '',
    trade.pnlPercent ?? '',
    trade.rMultiple ?? '',
    trade.riskRewardRatio ?? '',
    trade.followedPlan ? '是' : '否',
    trade.result,
    trade.holdingPeriod,
    trade.entryReason,
    trade.exitReason,
    trade.marketContext,
    trade.emotion,
    trade.errorTags.join('|'),
    trade.review,
  ]);

  return [csvHeaders, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n');
};

export const downloadTextFile = (filename: string, text: string, type: string) => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const parseCsvLine = (line: string) => {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};

const parseCsv = (text: string) => {
  const lines: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      current += char + next;
      i += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
      current += char;
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (current.trim()) lines.push(current);
      current = '';
      if (char === '\r' && next === '\n') i += 1;
    } else {
      current += char;
    }
  }

  if (current.trim()) lines.push(current);
  return lines.map(parseCsvLine);
};

export const csvToTrades = (text: string): Trade[] => {
  const rows = parseCsv(text);
  const bodyRows = rows[0]?.includes('日期') ? rows.slice(1) : rows;
  const now = new Date().toISOString();

  return bodyRows
    .filter((row) => row.some(Boolean))
    .map((row, index) => {
      const entryPrice = safeNumber(row[6]);
      const exitPrice = safeNumber(row[7]);
      const positionSize = safeNumber(row[8]);
      const stopLossPrice = safeNumber(row[9]);
      const takeProfitTarget = safeNumber(row[10]);
      const direction = row[3] === '做空' ? '做空' : '做多';
      const calculated = calculateTrade({
        direction,
        entryPrice,
        exitPrice,
        positionSize,
        stopLossPrice,
        takeProfitTarget,
      });

      return {
        id: `csv-${Date.now()}-${index}`,
        date: row[0] || new Date().toISOString().slice(0, 10),
        symbol: row[1] || 'UNKNOWN',
        marketType: row[2] === '合约' || row[2] === '链上股票' || row[2] === '其他' ? row[2] : '现货',
        direction,
        style: row[4] === '右侧' || row[4] === '不确定' ? row[4] : '左侧',
        timeframe:
          row[5] === '日线' || row[5] === '4小时' || row[5] === '1小时' || row[5] === '15分钟'
            ? row[5]
            : '其他',
        entryPrice,
        exitPrice,
        positionSize,
        stopLossPrice,
        takeProfitTarget,
        hasPlanBeforeEntry: row[15] === '是',
        plannedStopLoss: stopLossPrice,
        plannedTakeProfit: takeProfitTarget,
        executedStopLoss: row[15] === '是',
        executedTakeProfit: row[15] === '是',
        temporaryAddPosition: false,
        fearExit: false,
        fomoEntry: false,
        pnl: calculated.pnl,
        pnlPercent: calculated.pnlPercent,
        rMultiple: calculated.rMultiple,
        riskRewardRatio: calculated.riskRewardRatio,
        followedPlan: row[15] === '是',
        result: calculated.result,
        holdingPeriod: row[17] || '',
        entryReason: row[18] || '',
        exitReason: row[19] || '',
        marketContext: row[20] || '',
        emotion: row[21] || '',
        errorTags: row[22] ? row[22].split('|').filter(Boolean) : [],
        review: row[23] || '',
        createdAt: now,
        updatedAt: now,
      };
    });
};

export const parseJsonTrades = (text: string): Trade[] => {
  const parsed = JSON.parse(text) as Trade[];
  if (!Array.isArray(parsed)) {
    throw new Error('JSON 文件格式不正确');
  }
  return parsed;
};
