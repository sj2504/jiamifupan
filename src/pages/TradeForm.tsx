import { Save, X } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  directions,
  errorTagOptions,
  marketTypes,
  timeframes,
  tradeStyles,
  type Direction,
  type MarketType,
  type Timeframe,
  type Trade,
  type TradeFormData,
  type TradeStyle,
} from '../types';
import { calculateTrade, formatCurrency, formatPercent, formatR, safeNumber } from '../utils/calculations';
import { createEmptyTradeForm, formToTrade, tradeToForm } from '../utils/tradeFactory';

interface TradeFormProps {
  trade: Trade | null;
  onSave: (trade: Trade) => void;
  onCancel: () => void;
}

export function TradeForm({ trade, onSave, onCancel }: TradeFormProps) {
  const [form, setForm] = useState<TradeFormData>(() => (trade ? tradeToForm(trade) : createEmptyTradeForm()));
  const calculated = useMemo(() => calculateTrade(form), [form]);

  const setField = <K extends keyof TradeFormData>(key: K, value: TradeFormData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setNumberField = (key: keyof TradeFormData, value: string) => {
    setForm((current) => ({ ...current, [key]: safeNumber(value) }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.symbol.trim()) {
      window.alert('请填写交易品种');
      return;
    }
    onSave(formToTrade({ ...form, symbol: form.symbol.trim() }, trade ?? undefined));
  };

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <section className="rounded border border-line bg-white p-4">
        <h3 className="section-title">自动计算</h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <CalcBox label="实际盈亏 USDT" value={formatCurrency(calculated.pnl)} tone={(calculated.pnl ?? 0) >= 0 ? 'good' : 'bad'} />
          <CalcBox label="盈亏百分比" value={formatPercent(calculated.pnlPercent)} />
          <CalcBox label="R 倍数" value={formatR(calculated.rMultiple)} />
          <CalcBox
            label="风险回报比"
            value={calculated.riskRewardRatio === null ? '-' : `${calculated.riskRewardRatio}:1`}
          />
          <CalcBox label="交易结果" value={calculated.result} />
        </div>
      </section>

      <section className="form-section">
        <h3 className="section-title">基础信息</h3>
        <div className="form-grid">
          <Field label="日期">
            <input className="input" type="date" value={form.date} onChange={(event) => setField('date', event.target.value)} />
          </Field>
          <Field label="交易品种">
            <input
              className="input"
              value={form.symbol}
              onChange={(event) => setField('symbol', event.target.value.toUpperCase())}
              placeholder="BTC / ETH / LINK"
            />
          </Field>
          <Field label="市场类型">
            <select
              className="input"
              value={form.marketType}
              onChange={(event) => setField('marketType', event.target.value as MarketType)}
            >
              {marketTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="方向">
            <select
              className="input"
              value={form.direction}
              onChange={(event) => setField('direction', event.target.value as Direction)}
            >
              {directions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="交易风格">
            <select className="input" value={form.style} onChange={(event) => setField('style', event.target.value as TradeStyle)}>
              {tradeStyles.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="时间级别">
            <select
              className="input"
              value={form.timeframe}
              onChange={(event) => setField('timeframe', event.target.value as Timeframe)}
            >
              {timeframes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="form-section">
        <h3 className="section-title">价格与仓位</h3>
        <div className="form-grid">
          <NumberField label="入场价格" value={form.entryPrice} onChange={(value) => setNumberField('entryPrice', value)} />
          <NumberField label="出场价格" value={form.exitPrice} onChange={(value) => setNumberField('exitPrice', value)} />
          <NumberField label="仓位金额 USDT" value={form.positionSize} onChange={(value) => setNumberField('positionSize', value)} />
          <NumberField label="止损价格" value={form.stopLossPrice} onChange={(value) => setNumberField('stopLossPrice', value)} />
          <NumberField label="止盈目标" value={form.takeProfitTarget} onChange={(value) => setNumberField('takeProfitTarget', value)} />
        </div>
      </section>

      <section className="form-section">
        <h3 className="section-title">交易计划</h3>
        <div className="form-grid">
          <ToggleField label="入场前是否有明确交易计划" value={form.hasPlanBeforeEntry} onChange={(value) => setField('hasPlanBeforeEntry', value)} />
          <NumberField label="计划止损位" value={form.plannedStopLoss} onChange={(value) => setNumberField('plannedStopLoss', value)} />
          <NumberField label="计划止盈位" value={form.plannedTakeProfit} onChange={(value) => setNumberField('plannedTakeProfit', value)} />
          <ToggleField label="是否严格执行止损" value={form.executedStopLoss} onChange={(value) => setField('executedStopLoss', value)} />
          <ToggleField label="是否严格执行止盈" value={form.executedTakeProfit} onChange={(value) => setField('executedTakeProfit', value)} />
          <ToggleField label="是否临时加仓" value={form.temporaryAddPosition} onChange={(value) => setField('temporaryAddPosition', value)} />
          <ToggleField label="是否因为恐惧提前卖出" value={form.fearExit} onChange={(value) => setField('fearExit', value)} />
          <ToggleField label="是否因为 FOMO 追涨" value={form.fomoEntry} onChange={(value) => setField('fomoEntry', value)} />
          <ToggleField label="是否遵守计划" value={form.followedPlan} onChange={(value) => setField('followedPlan', value)} />
        </div>
      </section>

      <section className="form-section">
        <h3 className="section-title">主观记录</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <Textarea label="入场理由" value={form.entryReason} onChange={(value) => setField('entryReason', value)} />
          <Textarea label="出场理由" value={form.exitReason} onChange={(value) => setField('exitReason', value)} />
          <Textarea label="当时市场环境" value={form.marketContext} onChange={(value) => setField('marketContext', value)} />
          <Textarea label="当时情绪状态" value={form.emotion} onChange={(value) => setField('emotion', value)} />
          <Field label="持仓周期">
            <input
              className="input"
              value={form.holdingPeriod}
              onChange={(event) => setField('holdingPeriod', event.target.value)}
              placeholder="例如 3天 / 8小时 / 2周"
            />
          </Field>
          <Textarea label="复盘总结" value={form.review} onChange={(value) => setField('review', value)} />
        </div>
      </section>

      <section className="form-section">
        <h3 className="section-title">错误标签</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {errorTagOptions.map((tag) => {
            const checked = form.errorTags.includes(tag);
            return (
              <label key={tag} className={`tag-option ${checked ? 'tag-option-active' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setField(
                      'errorTags',
                      checked ? form.errorTags.filter((item) => item !== tag) : [...form.errorTags, tag],
                    );
                  }}
                />
                {tag}
              </label>
            );
          })}
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-page/95 py-4 backdrop-blur">
        <button className="btn-secondary" type="button" onClick={onCancel}>
          <X size={16} />
          取消
        </button>
        <button className="btn-primary" type="submit">
          <Save size={16} />
          保存交易
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        className="input"
        type="number"
        step="any"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex h-[66px] items-center justify-between gap-3 rounded border border-line bg-white px-3">
      <span className="text-sm font-medium">{label}</span>
      <input className="h-5 w-5 accent-accent" type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <textarea className="input min-h-[96px] resize-y" value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

function CalcBox({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="rounded border border-line bg-slate-50 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${tone === 'good' ? 'text-positive' : tone === 'bad' ? 'text-negative' : ''}`}>
        {value}
      </p>
    </div>
  );
}
