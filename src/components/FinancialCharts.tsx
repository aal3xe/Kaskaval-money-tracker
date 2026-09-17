import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { Language, TRANSLATIONS } from '../i18n';
import { ChevronRight, Edit3, Check } from 'lucide-react';
import { CurrencyCode, formatMoney } from '../utils/currency';

interface FinancialChartsProps {
  transactions: Transaction[];
  lang: Language;
  totalIncome: number;
  totalExpense: number;
  currency: CurrencyCode;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  transactions,
  lang,
  totalIncome,
  totalExpense,
  currency,
}) => {
  const t = TRANSLATIONS[lang];

  // Budget target persistence (starts at 0 if not set, so everything starts clean)
  const [budgetTarget, setBudgetTarget] = useState<number>(() => {
    const saved = localStorage.getItem('kaskaval_budget_target');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 0;
  });

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(budgetTarget > 0 ? budgetTarget.toString() : '');
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);

  useEffect(() => {
    if (budgetTarget > 0) {
      localStorage.setItem('kaskaval_budget_target', budgetTarget.toString());
    } else {
      localStorage.removeItem('kaskaval_budget_target');
    }
  }, [budgetTarget]);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      setBudgetTarget(val);
      setIsEditingBudget(false);
    }
  };

  // Category totals for actual expenses
  const expenses = transactions.filter(tx => tx.type === 'expense');
  const categoryMap: Record<string, { name: string; amount: number; color: string; count: number }> = {};

  expenses.forEach(tx => {
    const translatedName = (t.categories as Record<string, string>)[tx.categoryName] || tx.categoryName;
    if (!categoryMap[tx.categoryId]) {
      categoryMap[tx.categoryId] = {
        name: translatedName,
        amount: 0,
        color: tx.categoryColor || '#F3C77C',
        count: 0,
      };
    }
    categoryMap[tx.categoryId].amount += tx.amount;
    categoryMap[tx.categoryId].count += 1;
  });

  // Zero-state by default: only show actual user categories!
  const hasExpenses = expenses.length > 0;
  const displayCategorySlices = hasExpenses
    ? Object.values(categoryMap).sort((a, b) => b.amount - a.amount)
    : [];

  const effectiveTotalExpense = totalExpense;

  // SVG Donut Calculations
  const radius = 64;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  // 7 days trend calculations (Mon - Sun) strictly from real data
  const daysMap: Record<string, { dateStr: string; income: number; expense: number; label: string }> = {};
  const last7Days: string[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString(lang === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short' });
    last7Days.push(key);
    daysMap[key] = { dateStr: key, income: 0, expense: 0, label };
  }

  transactions.forEach(tx => {
    try {
      const timeMs = typeof tx.timestamp === 'number' && !isNaN(tx.timestamp) ? tx.timestamp : Date.now();
      const d = new Date(timeMs).toISOString().split('T')[0];
      if (daysMap[d]) {
        if (tx.type === 'income') daysMap[d].income += (tx.amount || 0);
        else daysMap[d].expense += (tx.amount || 0);
      }
    } catch {
      // Ignore safely
    }
  });

  const maxExpenseInWeek = Math.max(...last7Days.map(k => daysMap[k].expense), 0);
  const yMax = maxExpenseInWeek > 0 ? Math.max(Math.ceil(maxExpenseInWeek / 100) * 100, 100) : 100;

  return (
    <div className="space-y-4 mb-4">
      {/* 1. MONTHLY BUDGET OVERVIEW CARD */}
      <div
        id="monthly-budget-card"
        className="bg-[#131926] border border-[#1F2B3E] hover:border-[#27374E] rounded-[22px] p-5 shadow-xl transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
              {t.monthlyBudgetOverview || 'Monthly Budget Overview'}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setBudgetInput(budgetTarget > 0 ? budgetTarget.toString() : '');
                setIsEditingBudget(prev => !prev);
              }}
              className="text-slate-400 hover:text-[#F3C77C] p-1 rounded-md transition-colors"
              title={t.setBudgetPrompt || 'Set Budget'}
            >
              <Edit3 size={14} />
            </button>
            <ChevronRight size={16} className="text-slate-400" />
          </div>
        </div>

        {/* Budget target quick-editor */}
        {isEditingBudget && (
          <form onSubmit={handleSaveBudget} className="mb-4 p-2.5 bg-[#182030] border border-[#28374D] rounded-xl flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">{t.totalBudget || 'Total Budget'}:</span>
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="bg-[#0F1420] border border-[#2F3D55] text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#F3C77C] w-28 font-mono"
              placeholder="ex. 4000"
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#F3C77C] hover:bg-[#E5B869] text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Check size={13} />
              <span>OK</span>
            </button>
          </form>
        )}

        {/* Donut Ring Visual Centerpiece */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="relative flex items-center justify-center w-52 h-52">
            <svg className="w-52 h-52 -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#1B2333"
                strokeWidth={strokeWidth}
              />

              {/* Category Segments - Only real user data */}
              {displayCategorySlices.map((slice, index) => {
                const percentage = effectiveTotalExpense > 0 ? slice.amount / effectiveTotalExpense : 0;
                const strokeDasharray = `${percentage * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedOffset;
                accumulatedOffset += percentage * circumference;
                const isHovered = hoveredSlice === slice.name;

                return (
                  <circle
                    key={index}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredSlice(slice.name)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">
                {t.spent || 'Spent'}:
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {formatMoney(effectiveTotalExpense, currency)}
                </span>
                {budgetTarget > 0 && (
                  <span className="text-xs font-semibold text-[#F3C77C]">
                    / {formatMoney(budgetTarget, currency)}
                  </span>
                )}
              </div>
              {budgetTarget > 0 ? (
                <span className="text-[10px] text-slate-400 mt-0.5">
                  ({t.totalBudget || 'Total Budget'})
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingBudget(true)}
                  className="text-[11px] text-[#F3C77C] hover:underline mt-1 cursor-pointer transition-colors"
                >
                  + {t.setBudgetPrompt || 'Setează Buget'}
                </button>
              )}
            </div>
          </div>

          {/* Category Legend Badges or Clean Zero State */}
          {hasExpenses ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full mt-3 pt-3 border-t border-[#1C2638]">
              {displayCategorySlices.slice(0, 6).map((slice, idx) => {
                const pct = effectiveTotalExpense > 0 ? Math.round((slice.amount / effectiveTotalExpense) * 100) : 0;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-[#182030]/60 border border-[#232F42]/60 text-xs"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: slice.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-300 truncate font-medium">{slice.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {formatMoney(slice.amount, currency)} · {pct}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full mt-3 pt-3 border-t border-[#1C2638] text-center py-2">
              <p className="text-xs text-slate-300 font-medium">
                {t.noExpensesYet}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t.noExpensesSubtitle}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. WEEKLY SPENDING TRENDS CARD */}
      <div
        id="weekly-trends-card"
        className="bg-[#131926] border border-[#1F2B3E] hover:border-[#27374E] rounded-[22px] p-5 shadow-xl transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
            {t.weeklySpendingTrends || 'Weekly Spending Trends'}
          </h3>
          <ChevronRight size={16} className="text-slate-400" />
        </div>

        {/* Chart Stage with Y-Axis & Dual-tone Stacked Bars */}
        <div className="relative pt-2">
          {/* Y-Axis scale reference labels */}
          <div className="flex justify-between items-end h-40 pl-8 pr-1 relative">
            {/* Subtle horizontal grid lines */}
            <div className="absolute inset-x-8 top-0 border-b border-white/[0.04]" />
            <div className="absolute inset-x-8 top-1/3 border-b border-white/[0.04]" />
            <div className="absolute inset-x-8 top-2/3 border-b border-white/[0.04]" />
            <div className="absolute inset-x-8 bottom-6 border-b border-white/[0.08]" />

            {/* Y-axis markers */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 font-mono">
              <span>{formatMoney(yMax, currency)}</span>
              <span>{formatMoney(Math.round(yMax * 0.6), currency)}</span>
              <span>{formatMoney(Math.round(yMax * 0.2), currency)}</span>
              <span>{formatMoney(0, currency)}</span>
            </div>

            {/* 7 Days Bars - Real Data Only */}
            {last7Days.map((dayKey, idx) => {
              const item = {
                day: daysMap[dayKey].label,
                inc: daysMap[dayKey].income,
                exp: daysMap[dayKey].expense,
              };
              const totalHeightPct = item.exp > 0 ? Math.min(100, Math.max(8, Math.round((item.exp / yMax) * 100))) : 0;
              const isHovered = activeDayIndex === idx;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative z-10"
                  onMouseEnter={() => setActiveDayIndex(idx)}
                  onMouseLeave={() => setActiveDayIndex(null)}
                  onClick={() => setActiveDayIndex(activeDayIndex === idx ? null : idx)}
                >
                  {/* Tooltip on active */}
                  {isHovered && (
                    <div className="absolute -top-7 bg-[#1C2536] border border-[#2B384E] text-white text-[10px] px-2 py-0.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30 font-mono">
                      {formatMoney(item.exp, currency)}
                    </div>
                  )}

                  {/* Dual-color Bar or Baseline Zero Indicator */}
                  <div className="w-5 sm:w-6 flex flex-col justify-end items-center h-32 mb-1">
                    {item.exp > 0 ? (
                      <div
                        style={{ height: `${totalHeightPct}%` }}
                        className="w-full flex flex-col rounded-t-md overflow-hidden transition-all duration-300 group-hover:brightness-110 shadow-sm"
                      >
                        {/* Top Gold Cap (accent) */}
                        <div className="h-2.5 sm:h-3 w-full bg-[#F3C77C] shrink-0" />
                        {/* Teal / Mint Body */}
                        <div className="flex-1 w-full bg-[#14B8A6]" />
                      </div>
                    ) : (
                      <div className="w-2 h-1 bg-[#233045] rounded-full group-hover:bg-[#F3C77C]/60 transition-colors" />
                    )}
                  </div>

                  {/* Day Label */}
                  <span className="text-[11px] text-slate-400 font-medium capitalize mt-1">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. EXPENSE BREAKDOWN CARD */}
      <div
        id="expense-breakdown-card"
        className="bg-[#131926] border border-[#1F2B3E] hover:border-[#27374E] rounded-[22px] p-5 shadow-xl transition-all"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
            {t.expenseBreakdown || 'Expense Breakdown'}
          </h3>
          <ChevronRight size={16} className="text-slate-400" />
        </div>

        {/* Subheaders: Categories / Spending */}
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-[#1C2638] mb-3 font-medium">
          <span>{t.categoriesLabel || 'Categories'}</span>
          <span>{t.spendingLabel || 'Spending'}</span>
        </div>

        {/* Categories with Horizontal Pill Progress Bars */}
        {hasExpenses ? (
          <div className="space-y-3">
            {displayCategorySlices.map((cat, idx) => {
              const percentage = effectiveTotalExpense > 0
                ? Math.round((cat.amount / effectiveTotalExpense) * 100)
                : 0;

              return (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                  {/* Left: Category colored bullet + name */}
                  <div className="flex items-center gap-2 w-28 sm:w-32 shrink-0">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-200 font-medium truncate">{cat.name}</span>
                  </div>

                  {/* Middle: Horizontal Pill Progress Bar on dark track */}
                  <div className="flex-1 h-3 bg-[#1C2537] rounded-full overflow-hidden p-0.5">
                    <div
                      style={{
                        width: `${Math.max(percentage, 6)}%`,
                        backgroundColor: cat.color,
                      }}
                      className="h-full rounded-full transition-all duration-500 shadow-xs"
                    />
                  </div>

                  {/* Right: Amount & % */}
                  <div className="w-24 sm:w-28 text-right shrink-0">
                    <span className="text-slate-200 font-semibold font-mono">
                      {formatMoney(cat.amount, currency)}
                    </span>
                    <span className="text-slate-400 font-normal ml-1">· {percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs text-slate-300 font-medium">{t.noExpensesYet}</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              {t.noExpensesSubtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
