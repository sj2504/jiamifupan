import type { CalculatedTradeFields, Direction, Trade } from '../types';

const round = (value: number, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export const safeNumber = (value: unknown): number | null => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const calculateTrade = (input: {
  direction: Direction;
  entryPrice: number | null;
  exitPrice: number | null;
  positionSize: number | null;
  stopLossPrice: number | null;
  takeProfitTarget: number | null;
}): CalculatedTradeFields => {
  const { direction, entryPrice, exitPrice, positionSize, stopLossPrice, takeProfitTarget } = input;

  if (!entryPrice || !exitPrice || !positionSize) {
    return {
      pnl: null,
      pnlPercent: null,
      rMultiple: null,
      riskRewardRatio: null,
      result: '保本',
    };
  }

  const priceMove = direction === '做多' ? exitPrice - entryPrice : entryPrice - exitPrice;
  const pnlPercent = (priceMove / entryPrice) * 100;
  const pnl = positionSize * (pnlPercent / 100);
  const result = pnl > 0.0001 ? '盈利' : pnl < -0.0001 ? '亏损' : '保本';

  let rMultiple: number | null = null;
  let riskRewardRatio: number | null = null;

  if (stopLossPrice !== null) {
    const risk = direction === '做多' ? entryPrice - stopLossPrice : stopLossPrice - entryPrice;
    const reward =
      takeProfitTarget === null
        ? null
        : direction === '做多'
          ? takeProfitTarget - entryPrice
          : entryPrice - takeProfitTarget;

    if (risk > 0) {
      rMultiple = priceMove / risk;
      if (reward !== null && reward > 0) {
        riskRewardRatio = reward / risk;
      }
    }
  }

  return {
    pnl: round(pnl),
    pnlPercent: round(pnlPercent),
    rMultiple: rMultiple === null ? null : round(rMultiple),
    riskRewardRatio: riskRewardRatio === null ? null : round(riskRewardRatio),
    result,
  };
};

export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return `${value >= 0 ? '' : '-'}$${Math.abs(value).toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (value: number | null | undefined, suffix = '') => {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return `${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}${suffix}`;
};

export const formatPercent = (value: number | null | undefined) => formatNumber(value, '%');

export const formatR = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '未设置止损';
  return `${value.toFixed(2)}R`;
};

const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);

const average = (values: number[]) => (values.length ? sum(values) / values.length : 0);

const winRate = (trades: Trade[]) => {
  if (!trades.length) return 0;
  return (trades.filter((trade) => trade.result === '盈利').length / trades.length) * 100;
};

export const countTags = (trades: Trade[]) => {
  const counts = new Map<string, number>();
  trades.forEach((trade) => {
    trade.errorTags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
};

export const groupPnlBy = (trades: Trade[], selector: (trade: Trade) => string) => {
  const groups = new Map<string, { name: string; pnl: number; count: number }>();
  trades.forEach((trade) => {
    const key = selector(trade);
    const current = groups.get(key) ?? { name: key, pnl: 0, count: 0 };
    current.pnl += trade.pnl ?? 0;
    current.count += 1;
    groups.set(key, current);
  });

  return Array.from(groups.values()).map((item) => ({
    ...item,
    pnl: round(item.pnl),
  }));
};

export const buildEquityCurve = (trades: Trade[]) => {
  let cumulative = 0;
  return [...trades]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((trade, index) => {
      cumulative += trade.pnl ?? 0;
      return {
        name: `${index + 1}. ${trade.symbol}`,
        date: trade.date,
        pnl: trade.pnl ?? 0,
        cumulative: round(cumulative),
      };
    });
};

export const getTradeStats = (trades: Trade[]) => {
  const pnlValues = trades.map((trade) => trade.pnl ?? 0);
  const rValues = trades
    .map((trade) => trade.rMultiple)
    .filter((value): value is number => value !== null && Number.isFinite(value));
  const leftTrades = trades.filter((trade) => trade.style === '左侧');
  const rightTrades = trades.filter((trade) => trade.style === '右侧');
  const followedTrades = trades.filter((trade) => trade.followedPlan);
  const unfollowedTrades = trades.filter((trade) => !trade.followedPlan);
  const unfollowedLosses = unfollowedTrades.filter((trade) => (trade.pnl ?? 0) < 0);
  const tagCounts = countTags(trades);

  return {
    totalTrades: trades.length,
    winRate: round(winRate(trades)),
    totalPnl: round(sum(pnlValues)),
    averagePnl: round(average(pnlValues)),
    averageR: round(average(rValues)),
    maxLoss: round(Math.min(0, ...pnlValues)),
    maxWin: round(Math.max(0, ...pnlValues)),
    leftWinRate: round(winRate(leftTrades)),
    rightWinRate: round(winRate(rightTrades)),
    followedPlanWinRate: round(winRate(followedTrades)),
    unfollowedPlanLossCount: unfollowedLosses.length,
    mostCommonError: tagCounts[0]?.tag ?? '暂无',
    tagCounts,
  };
};

export const getStyleAnalysis = (trades: Trade[], style: Trade['style']) => {
  const scoped = trades.filter((trade) => trade.style === style);
  const pnlValues = scoped.map((trade) => trade.pnl ?? 0);
  const rValues = scoped
    .map((trade) => trade.rMultiple)
    .filter((value): value is number => value !== null && Number.isFinite(value));
  const tagCounts = countTags(scoped);

  return {
    trades: scoped,
    count: scoped.length,
    winRate: round(winRate(scoped)),
    averagePnl: round(average(pnlValues)),
    averageR: round(average(rValues)),
    totalLoss: round(sum(pnlValues.filter((value) => value < 0))),
    mostCommonError: tagCounts[0]?.tag ?? '暂无',
  };
};

export const getDisciplineAnalysis = (trades: Trade[]) => {
  const followed = trades.filter((trade) => trade.followedPlan);
  const unfollowed = trades.filter((trade) => !trade.followedPlan);
  const unfollowedLoss = sum(unfollowed.map((trade) => Math.min(0, trade.pnl ?? 0)));
  const followedLoss = sum(followed.map((trade) => Math.min(0, trade.pnl ?? 0)));

  return {
    followedCount: followed.length,
    unfollowedCount: unfollowed.length,
    followedWinRate: round(winRate(followed)),
    unfollowedWinRate: round(winRate(unfollowed)),
    unfollowedLoss: round(unfollowedLoss),
    followedLoss: round(followedLoss),
  };
};
