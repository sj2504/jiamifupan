import { AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartPanel } from '../components/ChartPanel';
import { MetricCard } from '../components/MetricCard';
import type { Trade } from '../types';
import {
  countTags,
  formatCurrency,
  formatNumber,
  formatPercent,
  getDisciplineAnalysis,
  getStyleAnalysis,
} from '../utils/calculations';

export function Review({ trades }: { trades: Trade[] }) {
  const left = getStyleAnalysis(trades, '左侧');
  const right = getStyleAnalysis(trades, '右侧');
  const discipline = getDisciplineAnalysis(trades);
  const tagCounts = countTags(trades);
  const topTag = tagCounts[0]?.tag ?? '暂无';
  const leftNeedsWarning = left.count > 0 && left.winRate < 45 && Math.abs(left.totalLoss) > left.count * 80;
  const rightNeedsWarning = right.count > 0 && right.totalLoss < -100;
  const disciplineWarning =
    discipline.unfollowedCount > 0 && Math.abs(discipline.unfollowedLoss) > Math.abs(discipline.followedLoss) * 1.2;

  return (
    <div className="grid gap-5">
      <section className="form-section">
        <div className="mb-4 flex items-center gap-2">
          <Target size={18} className="text-accent" />
          <h3 className="section-title mb-0">左侧交易分析</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="左侧交易次数" value={left.count} />
          <MetricCard label="左侧交易胜率" value={formatPercent(left.winRate)} />
          <MetricCard label="左侧平均盈亏" value={formatCurrency(left.averagePnl)} tone={left.averagePnl >= 0 ? 'good' : 'bad'} />
          <MetricCard label="左侧平均 R 倍数" value={formatNumber(left.averageR, 'R')} />
          <MetricCard label="左侧最常见错误" value={left.mostCommonError} />
        </div>
        {leftNeedsWarning && (
          <Insight tone="bad">你可能过早进场，需要等待止跌信号或降低仓位。</Insight>
        )}
        {!leftNeedsWarning && <Insight tone="good">左侧交易暂未显示明显失控，但仍建议持续观察进场过早和仓位过重问题。</Insight>}
      </section>

      <section className="form-section">
        <div className="mb-4 flex items-center gap-2">
          <Target size={18} className="text-accent" />
          <h3 className="section-title mb-0">右侧交易分析</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="右侧交易次数" value={right.count} />
          <MetricCard label="右侧交易胜率" value={formatPercent(right.winRate)} />
          <MetricCard label="右侧平均盈亏" value={formatCurrency(right.averagePnl)} tone={right.averagePnl >= 0 ? 'good' : 'bad'} />
          <MetricCard label="右侧平均 R 倍数" value={formatNumber(right.averageR, 'R')} />
          <MetricCard label="右侧最常见错误" value={right.mostCommonError} />
        </div>
        {rightNeedsWarning && (
          <Insight tone="bad">你可能经常追高，需要把止损放在结构位，而不是情绪止损。</Insight>
        )}
        {!rightNeedsWarning && <Insight tone="good">右侧交易亏损压力暂时可控，重点继续检查突破后是否有回踩确认。</Insight>}
      </section>

      <section className="form-section">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-positive" />
          <h3 className="section-title mb-0">纪律分析</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="遵守计划次数" value={discipline.followedCount} />
          <MetricCard label="未遵守计划次数" value={discipline.unfollowedCount} />
          <MetricCard label="遵守计划胜率" value={formatPercent(discipline.followedWinRate)} />
          <MetricCard label="未遵守计划胜率" value={formatPercent(discipline.unfollowedWinRate)} />
          <MetricCard label="未遵守计划总亏损" value={formatCurrency(discipline.unfollowedLoss)} tone="bad" />
        </div>
        {disciplineWarning && <Insight tone="bad">你的核心问题可能不是判断方向，而是执行纪律。</Insight>}
        {!disciplineWarning && <Insight tone="good">纪律问题暂未成为最大亏损来源，但每次不执行计划都值得单独复盘。</Insight>}
      </section>

      <section className="form-section">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-negative" />
          <h3 className="section-title mb-0">错误标签分析</h3>
        </div>
        <div className="mb-4 rounded border border-negative/20 bg-red-50 p-4 text-negative">
          <p className="text-sm">当前最需要修正的问题</p>
          <p className="mt-1 text-2xl font-semibold">{topTag}</p>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <ChartPanel title="错误标签出现次数">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="tag" tick={{ fontSize: 11 }} interval={0} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="出现次数" fill="#d92d20" />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
          <div className="rounded border border-line bg-white p-4">
            <h4 className="mb-3 font-semibold">排序</h4>
            <div className="grid gap-2">
              {tagCounts.map((item, index) => (
                <div key={item.tag} className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm">
                  <span>
                    {index + 1}. {item.tag}
                  </span>
                  <span className="font-semibold">{item.count} 次</span>
                </div>
              ))}
              {!tagCounts.length && <p className="text-sm text-muted">暂无错误标签数据</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Insight({ children, tone }: { children: string; tone: 'good' | 'bad' }) {
  return (
    <div
      className={`mt-4 rounded border p-4 text-sm ${
        tone === 'good'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
    >
      {children}
    </div>
  );
}
