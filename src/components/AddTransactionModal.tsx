import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Transaction, TransactionType } from '../types';
import { DEFAULT_CATEGORIES } from '../data/initialData';
import { CategoryIcon } from './CategoryIcon';
import { X, Check } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n';
import { CurrencyCode, CURRENCIES } from '../utils/currency';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  lang: Language;
  defaultType?: TransactionType;
  currency: CurrencyCode;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  lang,
  defaultType = 'expense',
  currency,
}) => {
  const t = TRANSLATIONS[lang];
  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(() => {
    return DEFAULT_CATEGORIES.find(c => c.type === defaultType) || DEFAULT_CATEGORIES[0];
  });
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('Cash');
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = DEFAULT_CATEGORIES.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError(lang === 'ro' ? 'Te rugăm să introduci o sumă validă.' : 'Please enter a valid amount.');
      return;
    }

    if (!title.trim()) {
      setError(lang === 'ro' ? 'Titlul este obligatoriu.' : 'Title is required.');
      return;
    }

    onSave({
      title: title.trim(),
      amount: numericAmount,
      type,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      timestamp: Date.now(),
      note: note.trim() || undefined,
      paymentMethod,
      syncedToCloud: false,
    });

    setTitle('');
    setAmount('');
    setNote('');
    setError(null);
    onClose();
  };

  const paymentOptions: Transaction['paymentMethod'][] = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Crypto',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            id="add-transaction-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal / Sheet */}
          <motion.div
            id="add-transaction-sheet"
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-[#131926] border border-[#233146] rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl z-10 text-slate-100"
          >
            {/* Native Mobile Sheet Pill */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-2 sm:hidden" />

            {/* Close Button */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                {type === 'expense' ? t.addExpense : t.addIncome}
              </h2>
              <button
                id="close-add-modal-btn"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={lang === 'ro' ? 'Închide' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2.5 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Expense / Income Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-[#182233] p-1 rounded-xl text-xs font-semibold border border-[#25344C]">
                <button
                  type="button"
                  id="type-toggle-expense"
                  onClick={() => {
                    setType('expense');
                    setSelectedCategory(DEFAULT_CATEGORIES[0]);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    type === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.expenses}
                </button>
                <button
                  type="button"
                  id="type-toggle-income"
                  onClick={() => {
                    setType('income');
                    const firstIncome = DEFAULT_CATEGORIES.find(c => c.type === 'income') || DEFAULT_CATEGORIES[0];
                    setSelectedCategory(firstIncome);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    type === 'income'
                      ? 'bg-[#F3C77C] text-slate-950 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.income}
                </button>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t.amount} ({CURRENCIES[currency]?.code || 'RON'})
                </label>
                <div className="relative">
                  {CURRENCIES[currency]?.position === 'prefix' ? (
                    <>
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-[#F3C77C] pointer-events-none">
                        {CURRENCIES[currency]?.symbol}
                      </span>
                      <input
                        id="input-transaction-amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-2xl font-bold text-white bg-[#0E1422] rounded-xl border border-[#25344C] focus:outline-none focus:border-[#F3C77C] font-mono"
                        autoFocus
                      />
                    </>
                  ) : (
                    <>
                      <input
                        id="input-transaction-amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full pl-4 pr-16 py-2 text-2xl font-bold text-white bg-[#0E1422] rounded-xl border border-[#25344C] focus:outline-none focus:border-[#F3C77C] font-mono"
                        autoFocus
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#F3C77C] pointer-events-none font-mono">
                        {CURRENCIES[currency]?.symbol}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t.titleOrPayee}
                </label>
                <input
                  id="input-transaction-title"
                  type="text"
                  required
                  placeholder={lang === 'ro' ? 'ex. Supermarket, Factură, Salariu' : 'e.g. Grocery Store, Client Invoice'}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-white bg-[#0E1422] rounded-xl border border-[#25344C] focus:outline-none focus:border-[#F3C77C]"
                />
              </div>

              {/* Category selection */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  {t.category}
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredCategories.map(cat => {
                    const isSelected = selectedCategory.id === cat.id;
                    const translatedCategory = (t.categories as Record<string, string>)[cat.name] || cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-all ${
                          isSelected
                            ? 'border-[#F3C77C] bg-[#F3C77C]/15 text-[#F3C77C] font-bold shadow-xs'
                            : 'border-[#222E42] hover:border-[#344460] bg-[#172030] text-slate-300'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white mb-1 shadow-xs"
                          style={{ backgroundColor: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} size={14} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] leading-tight truncate w-full">
                          {translatedCategory}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method & Note */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t.paymentMethod}
                  </label>
                  <select
                    id="select-payment-method"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as Transaction['paymentMethod'])}
                    className="w-full px-2.5 py-2 text-xs text-white bg-[#0E1422] rounded-xl border border-[#25344C] focus:outline-none focus:border-[#F3C77C]"
                  >
                    {paymentOptions.map(opt => (
                      <option key={opt} value={opt} className="bg-[#131926] text-white">
                        {(t.paymentMethods as Record<string, string>)[opt] || opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t.noteOptional}
                  </label>
                  <input
                    id="input-transaction-note"
                    type="text"
                    placeholder={lang === 'ro' ? 'Detalii' : 'Details'}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs text-white bg-[#0E1422] rounded-xl border border-[#25344C] focus:outline-none focus:border-[#F3C77C]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-transaction-btn"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#F3C77C] via-[#E5B869] to-[#D4A247] hover:brightness-105 text-slate-950 text-sm font-extrabold rounded-xl shadow-lg shadow-amber-500/15 active:scale-[0.99] transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{t.saveToRoom}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
