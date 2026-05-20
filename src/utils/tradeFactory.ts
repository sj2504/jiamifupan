import type { Trade, TradeFormData } from '../types';
import { calculateTrade } from './calculations';

export const createEmptyTradeForm = (): TradeFormData => ({
  date: new Date().toISOString().slice(0, 10),
  symbol: '',
  marketType: '现货',
  direction: '做多',
  style: '左侧',
  timeframe: '4小时',
  entryPrice: null,
  exitPrice: null,
  positionSize: null,
  stopLossPrice: null,
  takeProfitTarget: null,
  hasPlanBeforeEntry: true,
  plannedStopLoss: null,
  plannedTakeProfit: null,
  executedStopLoss: false,
  executedTakeProfit: false,
  temporaryAddPosition: false,
  fearExit: false,
  fomoEntry: false,
  followedPlan: true,
  holdingPeriod: '',
  entryReason: '',
  exitReason: '',
  marketContext: '',
  emotion: '',
  errorTags: [],
  review: '',
});

export const formToTrade = (form: TradeFormData, existing?: Trade): Trade => {
  const calculated = calculateTrade(form);
  const now = new Date().toISOString();

  return {
    ...form,
    ...calculated,
    id: existing?.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
};

export const tradeToForm = (trade: Trade): TradeFormData => ({
  date: trade.date,
  symbol: trade.symbol,
  marketType: trade.marketType,
  direction: trade.direction,
  style: trade.style,
  timeframe: trade.timeframe,
  entryPrice: trade.entryPrice,
  exitPrice: trade.exitPrice,
  positionSize: trade.positionSize,
  stopLossPrice: trade.stopLossPrice,
  takeProfitTarget: trade.takeProfitTarget,
  hasPlanBeforeEntry: trade.hasPlanBeforeEntry,
  plannedStopLoss: trade.plannedStopLoss,
  plannedTakeProfit: trade.plannedTakeProfit,
  executedStopLoss: trade.executedStopLoss,
  executedTakeProfit: trade.executedTakeProfit,
  temporaryAddPosition: trade.temporaryAddPosition,
  fearExit: trade.fearExit,
  fomoEntry: trade.fomoEntry,
  followedPlan: trade.followedPlan,
  holdingPeriod: trade.holdingPeriod,
  entryReason: trade.entryReason,
  exitReason: trade.exitReason,
  marketContext: trade.marketContext,
  emotion: trade.emotion,
  errorTags: trade.errorTags,
  review: trade.review,
});
