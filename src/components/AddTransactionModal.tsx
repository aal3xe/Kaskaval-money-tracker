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

  // Update selected category when type changes
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
      category: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      date: new Date().toISOString(),
      note: note.trim() || undefined,
      paymentMethod,
      syncedToCloud: false,
    });

    // Reset and close
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
          {/* Backdrop with fade animation */}
          <motion.div
            id="add-transaction-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal / Sheet with smooth slide-up animation from bottom */}
          <motion.div
            id="add-transaction-sheet"
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl z-10"
          >
            {/* Native Mobile Sheet Pill */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-2 sm:hidden" />

            {/* Close Button */}
            <div className="flex items-center justify-end">
              <button
                id="close-add-modal-btn"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title={lang === 'ro' ? 'Închide' : 'Close'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-2 p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-2 space-y-3.5">
              {/* Expense / Income Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  id="type-toggle-expense"
                  onClick={() => {
                    setType('expense');
                    setSelectedCategory(DEFAULT_CATEGORIES[0]);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
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
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.income}
                </button>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {t.amount} ({CURRENCIES[currency]?.code || 'RON'})
                </label>
                <div className="relative">
                  {CURRENCIES[currency]?.position === 'prefix' ? (
                    <>
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400 pointer-events-none">
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
                        className="w-full pl-9 pr-4 py-2 text-2xl font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="w-full pl-4 pr-16 py-2 text-2xl font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">
                        {CURRENCIES[currency]?.symbol}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {t.titleOrPayee}
                </label>
                <input
                  id="input-transaction-title"
                  type="text"
                  required
                  placeholder={lang === 'ro' ? 'ex. Supermarket, Factură, Salariu' : 'e.g. Grocery Store, Client Invoice'}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category selection - 8 categories in 2 rows of 4 */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  {t.category}
                </label>
                <div className="grid grid-cols-4 gap-2">
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
                            ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700 font-semibold shadow-xs ring-1 ring-indigo-500/20'
                            : 'border-slate-100 hover:border-slate-200 bg-slate-50/70 text-slate-600'
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
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {t.paymentMethod}
                  </label>
                  <select
                    id="select-payment-method"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as Transaction['paymentMethod'])}
                    className="w-full px-2.5 py-2 text-xs text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {paymentOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {(t.paymentMethods as Record<string, string>)[opt] || opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {t.noteOptional}
                  </label>
                  <input
                    id="input-transaction-note"
                    type="text"
                    placeholder={lang === 'ro' ? 'Detalii adiționale' : 'Details'}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="submit-transaction-btn"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-indigo-500/20 active:scale-[0.99] transition-all"
                >
                  <Check className="w-4 h-4" />
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
