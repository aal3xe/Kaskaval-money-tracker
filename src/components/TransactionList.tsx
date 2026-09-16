import React from 'react';
import { Transaction } from '../types';
import { SwipeableTransactionItem } from './SwipeableTransactionItem';
import { Language, TRANSLATIONS } from '../i18n';
import { SlidersHorizontal } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  lang: Language;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  selectedFilter,
  onFilterChange,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const filterOptions = [
    { key: 'All', label: t.all },
    { key: 'Expenses', label: t.onlyExpenses },
    { key: 'Income', label: t.onlyIncome },
  ];

  const filtered = transactions.filter(tx => {
    if (selectedFilter === 'Expenses') return tx.type === 'expense';
    if (selectedFilter === 'Income') return tx.type === 'income';
    return true;
  });

  return (
    <div id="transactions-card" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      {/* Header & Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{t.recentTransactions}</h3>
        </div>

        {/* Filter chips (Material 3 style) */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              id={`filter-${opt.key.toLowerCase()}`}
              onClick={() => onFilterChange(opt.key)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                selectedFilter === opt.key
                  ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gmail swipe hint banner */}
      <div className="mb-3 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 text-[11px] text-slate-500">
        <SlidersHorizontal size={13} className="text-indigo-500 shrink-0" />
        <span className="truncate">{t.deleteSwipeHint}</span>
      </div>

      {/* List items */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-xs text-slate-400 font-medium">{t.noTransactionsFound}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{t.emptyListHint}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(tx => (
            <SwipeableTransactionItem
              key={tx.id}
              transaction={tx}
              onDelete={onDelete}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
};
