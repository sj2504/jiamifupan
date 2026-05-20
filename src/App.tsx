import { useEffect, useMemo, useState } from 'react';
import { BarChart3, ClipboardList, LayoutDashboard, Plus, RefreshCcw, SearchCheck } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { TradeLog } from './pages/TradeLog';
import { TradeForm } from './pages/TradeForm';
import { Review } from './pages/Review';
import { loadTrades, resetTrades, saveTrades } from './utils/storage';
import type { Trade } from './types';
import { DataManager } from './components/DataManager';

type View = 'dashboard' | 'log' | 'form' | 'review';

const navItems: Array<{ view: View; label: string; icon: typeof LayoutDashboard }> = [
  { view: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
  { view: 'log', label: '交易记录', icon: ClipboardList },
  { view: 'form', label: '新增交易', icon: Plus },
  { view: 'review', label: '复盘分析', icon: SearchCheck },
];

export function App() {
  const [trades, setTrades] = useState<Trade[]>(() => loadTrades());
  const [view, setView] = useState<View>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    saveTrades(trades);
  }, [trades]);

  const editingTrade = useMemo(
    () => trades.find((trade) => trade.id === editingId) ?? null,
    [editingId, trades],
  );

  const handleSaveTrade = (trade: Trade) => {
    setTrades((current) => {
      const exists = current.some((item) => item.id === trade.id);
      if (exists) {
        return current.map((item) => (item.id === trade.id ? trade : item));
      }
      return [trade, ...current];
    });
    setEditingId(null);
    setView('log');
  };

  const handleEdit = (trade: Trade) => {
    setEditingId(trade.id);
    setView('form');
  };

  const handleDelete = (id: string) => {
    const confirmed = window.confirm('确认删除这条交易记录吗？此操作无法撤销。');
    if (!confirmed) return;
    setTrades((current) => current.filter((trade) => trade.id !== id));
  };

  const handleResetSamples = () => {
    const confirmed = window.confirm('确认恢复 5 条示例数据吗？当前数据会被覆盖。');
    if (!confirmed) return;
    setTrades(resetTrades());
    setView('dashboard');
  };

  const pageTitle =
    view === 'dashboard'
      ? '仪表盘'
      : view === 'log'
        ? '交易记录'
        : view === 'form'
          ? editingTrade
            ? '编辑交易'
            : '新增交易'
          : '复盘分析';

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-ink text-white">
                <BarChart3 size={22} />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-normal">交易复盘工具 MVP</h1>
                <p className="text-sm text-muted">记录交易，复盘行为，比较左侧与右侧交易表现</p>
              </div>
            </div>
          </div>
          <button className="btn-secondary w-fit" onClick={handleResetSamples}>
            <RefreshCcw size={16} />
            恢复示例数据
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] gap-5 px-5 py-5 lg:grid-cols-[220px_1fr]">
        <aside className="self-start rounded border border-line bg-white p-2">
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.view;
              return (
                <button
                  key={item.view}
                  className={`nav-item ${active ? 'nav-item-active' : ''}`}
                  onClick={() => {
                    if (item.view !== 'form') setEditingId(null);
                    setView(item.view);
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <DataManager trades={trades} onReplaceTrades={setTrades} />
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{pageTitle}</h2>
              <p className="text-sm text-muted">当前共有 {trades.length} 条交易记录</p>
            </div>
            {view === 'log' && (
              <button
                className="btn-primary w-fit"
                onClick={() => {
                  setEditingId(null);
                  setView('form');
                }}
              >
                <Plus size={16} />
                新增交易
              </button>
            )}
          </div>

          {view === 'dashboard' && <Dashboard trades={trades} />}
          {view === 'log' && <TradeLog trades={trades} onEdit={handleEdit} onDelete={handleDelete} />}
          {view === 'form' && (
            <TradeForm
              key={editingTrade?.id ?? 'new'}
              trade={editingTrade}
              onSave={handleSaveTrade}
              onCancel={() => {
                setEditingId(null);
                setView('log');
              }}
            />
          )}
          {view === 'review' && <Review trades={trades} />}
        </section>
      </main>
    </div>
  );
}
