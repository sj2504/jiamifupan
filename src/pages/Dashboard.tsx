import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartPanel } from '../components/ChartPanel';
import { MetricCard } from '../components/MetricCard';
import type { Trade } from '../types';
import {
  buildEquityCurve,
  formatCurrency,
  formatNumber,
  formatPercent,
  groupPnlBy,
  getTradeStats,
} from '../utils/calculations';

export function Dashboard({ trades }: { trades: Trade[] }) {
  const stats = getTradeStats(trades);
  const equityCurve = buildEquityCurve(trades);
  const stylePerformance = groupPnlBy(
    trades.filter((trade) => trade.style !== '不确定'),
    (trade) => trade.style,
  );
  const symbolPerformance = groupPnlBy(trades, (trade) => trade.symbol);

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="总交易次数" value={stats.totalTrades} />
        <MetricCard label="胜率" value={formatPercent(stats.winRate)} />
        <MetricCard
          label="总盈亏"
          value={formatCurrency(stats.totalPnl)}
          tone={stats.totalPnl >= 0 ? 'good' : 'bad'}
        />
        <MetricCard
          label="平均盈亏"
          value={formatCurrency(stats.averagePnl)}
          tone={stats.averagePnl >= 0 ? 'good' : 'bad'}
        />
        <MetricCard label="平均 R 倍数" value={formatNumber(stats.averageR, 'R')} />
        <MetricCard label="最大单笔亏损" value={formatCurrency(stats.maxLoss)} tone="bad" />
        <MetricCard label="最大单笔盈利" value={formatCurrency(stats.maxWin)} tone="good" />
        <MetricCard label="左侧交易胜率" value={formatPercent(stats.leftWinRate)} />
        <MetricCard label="右侧交易胜率" value={formatPercent(stats.rightWinRate)} />
        <MetricCard label="遵守交易计划的胜率" value={formatPercent(stats.followedPlanWinRate)} />
        <MetricCard label="未遵守计划亏损次数" value={stats.unfollowedPlanLossCount} tone="bad" />
        <MetricCard label="当前最常见错误标签" value={stats.mostCommonError} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartPanel title="每笔交易盈亏曲线">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityCurve}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="cumulative" name="累计盈亏" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="pnl" name="单笔盈亏" stroke="#667085" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="左侧 vs 右侧交易表现对比">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stylePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="pnl" name="总盈亏">
                {stylePerformance.map((item) => (
                  <Cell key={item.name} fill={item.pnl >= 0 ? '#0f9f6e' : '#d92d20'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="不同交易品种的盈亏表现">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={symbolPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="pnl" name="总盈亏">
                {symbolPerformance.map((item) => (
                  <Cell key={item.name} fill={item.pnl >= 0 ? '#0f9f6e' : '#d92d20'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="不同错误标签出现次数">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.tagCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tag" interval={0} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="出现次数" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </div>
  );
}
