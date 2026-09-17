import React from 'react';
import { Transaction } from '../types';
import { SwipeableTransactionItem } from './SwipeableTransactionItem';
import { Language, TRANSLATIONS } from '../i18n';
import { SlidersHorizontal } from 'lucide-react';
import { CurrencyCode } from '../utils/currency';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  lang: Language;
  currency: CurrencyCode;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  selectedFilter,
  onFilterChange,
  lang,
  currency,
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
    <div
      id="transactions-card"
      className="bg-[#131926] border border-[#1F2B3E] hover:border-[#27374E] rounded-[22px] p-5 shadow-xl transition-all"
    >
      {/* Header & Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">{t.recentTransactions}</h3>
        </div>

        {/* Filter chips (Dark Luxury style) */}
        <div className="flex items-center gap-1.5 bg-[#182030] border border-[#243349] p-1 rounded-xl">
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              id={`filter-${opt.key.toLowerCase()}`}
              onClick={() => onFilterChange(opt.key)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                selectedFilter === opt.key
                  ? 'bg-[#F3C77C] text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gmail swipe hint banner */}
      <div className="mb-3 px-3 py-1.5 bg-[#182030]/50 border border-[#232F42]/60 rounded-xl flex items-center gap-2 text-[11px] text-slate-400">
        <SlidersHorizontal size={13} className="text-[#F3C77C] shrink-0" />
        <span className="truncate">{t.deleteSwipeHint}</span>
      </div>

      {/* List items */}
      {filtered.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-xs text-slate-400 font-medium">{t.noTransactionsFound}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{t.emptyListHint}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(tx => (
            <SwipeableTransactionItem
              key={tx.id}
              transaction={tx}
              onDelete={onDelete}
              lang={lang}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
};
