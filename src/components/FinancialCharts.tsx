import React, { useState } from 'react';
import { Transaction } from '../types';
import { Language, TRANSLATIONS } from '../i18n';
import { TrendingUp, TrendingDown, Calendar, ArrowLeft } from 'lucide-react';
import { ChartStyle } from './AuthDrawer';

interface FinancialChartsProps {
  transactions: Transaction[];
  lang: Language;
  totalIncome: number;
  totalExpense: number;
  chartStyle: ChartStyle;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  transactions,
  lang,
  totalIncome,
  totalExpense,
  chartStyle,
}) => {
  const t = TRANSLATIONS[lang];
  const [showTrend, setShowTrend] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Diferența netă (Venituri - Cheltuieli)
  const difference = totalIncome - totalExpense;
  const isPositive = difference >= 0;
  const totalVolume = totalIncome + totalExpense;

  // Category totals for expenses
  const expenses = transactions.filter(t => t.type === 'expense');
  const categoryMap: Record<string, { name: string; amount: number; color: string }> = {};

  expenses.forEach(tx => {
    const translatedName = (t.categories as Record<string, string>)[tx.categoryName] || tx.categoryName;
    if (!categoryMap[tx.categoryId]) {
      categoryMap[tx.categoryId] = {
        name: translatedName,
        amount: 0,
        color: tx.categoryColor,
      };
    }
    categoryMap[tx.categoryId].amount += tx.amount;
  });

  const categorySlices = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);

  // SVG Ring Calculations
  const radius = 72;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  // 7 days trend calculations
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
    const d = new Date(tx.timestamp).toISOString().split('T')[0];
    if (daysMap[d]) {
      if (tx.type === 'income') daysMap[d].income += tx.amount;
      else daysMap[d].expense += tx.amount;
    }
  });

  const maxTrendValue = Math.max(
    ...last7Days.map(k => Math.max(daysMap[k].income, daysMap[k].expense)),
    100
  );

  let accumulatedCatOffset = 0;

  return (
    <div id="financial-charts-card" className="bg-white rounded-2xl p-5 shadow-xs border border-slate-100 mb-4">
      {/* Header cu Titlu și Buton de Evoluție */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {showTrend
              ? t.trendTab
              : chartStyle === 'categories'
              ? (lang === 'ro' ? 'Balanță & Categorii' : 'Balance & Categories')
              : (lang === 'ro' ? 'Balanță & Proporții' : 'Balance & Proportions')}
          </h3>
          <span className="text-[11px] text-slate-400 block">
            {showTrend
              ? (lang === 'ro' ? 'Venituri și cheltuieli pe ultimele 7 zile' : 'Income and expenses over the last 7 days')
              : (lang === 'ro' ? 'Situație financiară curentă' : 'Current financial overview')}
          </span>
        </div>

        {/* Buton Evoluție pe main */}
        <button
          id="toggle-trend-btn"
          onClick={() => setShowTrend(prev => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
            showTrend
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title={showTrend ? t.backToChartBtn : t.trendBtn}
        >
          {showTrend ? <ArrowLeft size={13} /> : <Calendar size={13} />}
          <span>{showTrend ? t.backToChartBtn : t.trendBtn}</span>
        </button>
      </div>

      {/* 1. AFISARE EVOLUTIE PE ZILE (cand e activat butonul Evolutie) */}
      {showTrend ? (
        <div className="pt-2">
          <div className="flex items-end justify-between h-40 gap-2 px-1">
            {last7Days.map(dayKey => {
              const item = daysMap[dayKey];
              const incHeightPct = Math.max(4, Math.round((item.income / maxTrendValue) * 100));
              const expHeightPct = Math.max(4, Math.round((item.expense / maxTrendValue) * 100));

              return (
                <div key={dayKey} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center gap-1 h-32 bg-slate-50 rounded-t-md p-0.5">
                    {/* Income bar */}
                    <div
                      title={`${t.income}: $${item.income.toFixed(2)}`}
                      style={{ height: `${incHeightPct}%` }}
                      className="w-2.5 sm:w-3 bg-emerald-500 rounded-t-sm transition-all duration-300"
                    />
                    {/* Expense bar */}
                    <div
                      title={`${t.expenses}: $${item.expense.toFixed(2)}`}
                      style={{ height: `${expHeightPct}%` }}
                      className="w-2.5 sm:w-3 bg-rose-500 rounded-t-sm transition-all duration-300"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium capitalize">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-3 pt-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>{t.income}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>{t.expenses}</span>
            </div>
          </div>
        </div>
      ) : chartStyle === 'categories' ? (
        /* 2. REPREZENTARE PE ROTUND (CATEGORII PE CERC CU DIFERENȚA ÎN MIJLOC) */
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
          {/* Inel rotund cu categoriile și diferența mare în centru */}
          <div className="relative flex items-center justify-center w-52 h-52 shrink-0">
            <svg className="w-52 h-52 -rotate-90 transform" viewBox="0 0 180 180">
              {/* Background circle */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />

              {totalExpense === 0 ? (
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth={strokeWidth}
                />
              ) : (
                categorySlices.map((slice, index) => {
                  const percentage = slice.amount / totalExpense;
                  const strokeDasharray = `${percentage * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedCatOffset;
                  accumulatedCatOffset += percentage * circumference;
                  const isHovered = hoveredSlice === slice.name;

                  return (
                    <circle
                      key={index}
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice(slice.name)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })
              )}
            </svg>

            {/* DIFERENȚA ÎN MIJLOC */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {t.netDifference}
              </span>
              <span
                className={`text-2xl font-black tracking-tight my-0.5 ${
                  isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isPositive ? '+' : '-'}${Math.abs(difference).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isPositive
                    ? 'bg-emerald-100/70 text-emerald-700'
                    : 'bg-rose-100/70 text-rose-700'
                }`}
              >
                {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>{isPositive ? t.surplus : t.deficit}</span>
              </div>
            </div>
          </div>

          {/* Listă categorii alăturată */}
          <div className="flex-1 w-full max-w-xs space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {categorySlices.map((cat, idx) => {
              const pct = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(cat.name)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-700 truncate font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-slate-800">${cat.amount.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 w-7 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
            {categorySlices.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">{t.noExpenses}</p>
            )}
          </div>
        </div>
      ) : (
        /* 3. REPREZENTARE PE DREPT (BARE PROPORȚIONALE CU DIFERENȚA CENTRALĂ) */
        <div className="py-2 space-y-5">
          {/* Card central cu Diferența */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">{t.netDifference} (Venit - Cheltuieli)</span>
              <span className={`text-xl font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isPositive ? '+' : '-'}${Math.abs(difference).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
              isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{isPositive ? t.surplus : t.deficit}</span>
            </div>
          </div>

          {/* Bară proporțională orizontală drept (Venit vs Cheltuieli) */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {t.income} ({totalVolume > 0 ? Math.round((totalIncome / totalVolume) * 100) : 50}%)
              </span>
              <span className="flex items-center gap-1 text-rose-600">
                {t.expenses} ({totalVolume > 0 ? Math.round((totalExpense / totalVolume) * 100) : 50}%)
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              </span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full flex overflow-hidden p-0.5">
              <div
                style={{ width: `${totalVolume > 0 ? (totalIncome / totalVolume) * 100 : 50}%` }}
                className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                title={`${t.income}: $${totalIncome.toFixed(2)}`}
              />
              <div
                style={{ width: `${totalVolume > 0 ? (totalExpense / totalVolume) * 100 : 50}%` }}
                className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                title={`${t.expenses}: $${totalExpense.toFixed(2)}`}
              />
            </div>
          </div>

          {/* Bare orizontale drepte pentru fiecare categorie de cheltuială */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2.5">{t.categoryBreakdown}</span>
            <div className="space-y-2.5">
              {categorySlices.map((cat, idx) => {
                const pct = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat.name}</span>
                      <span className="font-semibold text-slate-900">${cat.amount.toFixed(2)} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
              {categorySlices.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">{t.noExpenses}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sumar fix Venituri și Cheltuieli sub grafic */}
      <div id="income-expense-summary" className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
        {/* Venituri */}
        <div className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-100/80">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] text-emerald-700 font-medium block truncate">{t.income}</span>
            <span className="text-sm sm:text-base font-bold text-emerald-700 tracking-tight">
              +${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Cheltuieli */}
        <div className="flex items-center gap-3 p-3 bg-rose-50/70 rounded-xl border border-rose-100/80">
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingDown size={18} />
          </div>
          <div className="overflow-hidden">
            <span className="text-[11px] text-rose-700 font-medium block truncate">{t.expenses}</span>
            <span className="text-sm sm:text-base font-bold text-rose-700 tracking-tight">
              -${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
