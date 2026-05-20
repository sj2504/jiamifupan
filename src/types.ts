export type MarketType = '现货' | '合约' | '链上股票' | '其他';
export type Direction = '做多' | '做空';
export type TradeStyle = '左侧' | '右侧' | '不确定';
export type Timeframe = '日线' | '4小时' | '1小时' | '15分钟' | '其他';
export type TradeResult = '盈利' | '亏损' | '保本';

export const marketTypes: MarketType[] = ['现货', '合约', '链上股票', '其他'];
export const directions: Direction[] = ['做多', '做空'];
export const tradeStyles: TradeStyle[] = ['左侧', '右侧', '不确定'];
export const timeframes: Timeframe[] = ['日线', '4小时', '1小时', '15分钟', '其他'];
export const tradeResults: TradeResult[] = ['盈利', '亏损', '保本'];

export const errorTagOptions = [
  '追涨',
  '杀跌',
  '没有止损',
  '止损太近',
  '仓位过重',
  '频繁交易',
  '恐惧卖出',
  '贪婪不止盈',
  '逆势交易',
  '没有等待确认',
  '左侧过早进场',
  '右侧追高',
  'BTC 环境判断错误',
  '没按计划执行',
  '其他',
] as const;

export type ErrorTag = (typeof errorTagOptions)[number];

export interface Trade {
  id: string;
  date: string;
  symbol: string;
  marketType: MarketType;
  direction: Direction;
  style: TradeStyle;
  timeframe: Timeframe;
  entryPrice: number | null;
  exitPrice: number | null;
  positionSize: number | null;
  stopLossPrice: number | null;
  takeProfitTarget: number | null;
  hasPlanBeforeEntry: boolean;
  plannedStopLoss: number | null;
  plannedTakeProfit: number | null;
  executedStopLoss: boolean;
  executedTakeProfit: boolean;
  temporaryAddPosition: boolean;
  fearExit: boolean;
  fomoEntry: boolean;
  pnl: number | null;
  pnlPercent: number | null;
  rMultiple: number | null;
  riskRewardRatio: number | null;
  result: TradeResult;
  followedPlan: boolean;
  holdingPeriod: string;
  entryReason: string;
  exitReason: string;
  marketContext: string;
  emotion: string;
  errorTags: string[];
  review: string;
  createdAt: string;
  updatedAt: string;
}

export type TradeFormData = Omit<
  Trade,
  'id' | 'pnl' | 'pnlPercent' | 'rMultiple' | 'riskRewardRatio' | 'result' | 'createdAt' | 'updatedAt'
>;

export interface CalculatedTradeFields {
  pnl: number | null;
  pnlPercent: number | null;
  rMultiple: number | null;
  riskRewardRatio: number | null;
  result: TradeResult;
}
