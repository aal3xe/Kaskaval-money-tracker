import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from './types';
import { RoomDatabaseEmulator } from './data/roomDatabase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthDrawer, ChartStyle } from './components/AuthDrawer';
import { FinancialCharts } from './components/FinancialCharts';
import { TransactionList } from './components/TransactionList';
import { AddTransactionModal } from './components/AddTransactionModal';
import { Language, TRANSLATIONS } from './i18n';
import { CurrencyCode, getStoredCurrency, setStoredCurrency } from './utils/currency';
import {
  Wallet,
  Plus,
  Undo2,
  Menu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Analytics } from '@vercel/analytics/react';

export function MoneyTrackerApp() {
  // Primary language default to Romanian ('ro') with English ('en') toggle
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('money_tracker_lang') as Language) || 'ro';
  });

  // Currency selection defaulting to Romanian Leu ('RON')
  const [currency, setCurrency] = useState<CurrencyCode>(() => getStoredCurrency());

  // Chart representation style preference: 'categories' (round) or 'linear' (straight bars)
  const [chartStyle, setChartStyle] = useState<ChartStyle>(() => {
    return (localStorage.getItem('preferred_chart_style') as ChartStyle) || 'categories';
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalTransactionType, setModalTransactionType] = useState<TransactionType>('expense');
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [deletedTxBackup, setDeletedTxBackup] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { user } = useAuth();
  const t = TRANSLATIONS[lang];
  const room = RoomDatabaseEmulator.getInstance();

  useEffect(() => {
    localStorage.setItem('money_tracker_lang', lang);
  }, [lang]);

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    setStoredCurrency(newCurrency);
  };

  const handleClearAllData = async () => {
    await room.clearAll();
    setTransactions([]);
    setToastMessage(lang === 'ro' ? 'Toate tranzacțiile au fost șterse. Start de la 0!' : 'All transactions cleared. Fresh start at 0.00!');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    setTransactions(room.getAll());
    const unsubscribe = room.subscribe(() => {
      setTransactions(room.getAll());
    });
    return () => unsubscribe();
  }, []);

  // Compute metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleOpenAddModal = (initialType: TransactionType) => {
    setModalTransactionType(initialType);
    setIsAddModalOpen(true);
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id' | 'userId'>) => {
    const id = 'tx_' + Date.now();
    await room.insert({
      ...newTx,
      id,
      userId: user?.uid || 'user_active',
    });

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.85 },
      colors: newTx.type === 'income' ? ['#10B981', '#34D399', '#059669'] : ['#F43F5E', '#FB7185', '#E11D48'],
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    const target = transactions.find(tx => tx.id === id);
    if (target) {
      setDeletedTxBackup(target);
      await room.delete(id);
      setToastMessage(`${t.deletedToast}: "${target.title}"`);
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    }
  };

  const handleUndoDelete = async () => {
    if (deletedTxBackup) {
      await room.insert(deletedTxBackup);
      setDeletedTxBackup(null);
      setToastMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 antialiased py-3 sm:py-6 px-3 sm:px-4 relative selection:bg-[#F3C77C] selection:text-slate-950">
      {/* Ambient subtle glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(243,199,124,0.07),rgba(20,184,166,0.03),transparent)]" />

      {/* Top Header Bar */}
      <header className="max-w-md sm:max-w-lg md:max-w-xl mx-auto mb-4 flex items-center justify-between gap-3 px-1 relative z-10">
        <div className="flex items-center gap-2.5">
          <img
            src="/pwa-192x192.png"
            alt="Kaskaval"
            className="w-8 h-8 rounded-xl object-cover shadow-sm border border-amber-500/30 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-[0.18em] text-[#F3C77C] uppercase drop-shadow-xs leading-none">
                KASKAVAL
              </h1>
            </div>
            <a
              href="https://kaskaval.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10.5px] text-slate-400 hover:text-[#F3C77C] font-mono tracking-wide transition-colors block mt-0.5"
              title="kaskaval.online"
            >
              kaskaval.online
            </a>
          </div>
        </div>

        {/* Action Controls: Profile Avatar & Burger Menu */}
        <div className="flex items-center gap-2">
          <button
            id="profile-avatar-btn"
            onClick={() => setIsAuthDrawerOpen(true)}
            className="relative group transition-transform active:scale-95"
            title={user ? (user.displayName || user.email || 'Profile') : 'Settings'}
            aria-label="Profile and Settings"
          >
            <div className="w-9 h-9 rounded-full ring-2 ring-[#E5B869] p-0.5 overflow-hidden bg-[#182233] flex items-center justify-center shadow-md shadow-amber-500/10">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600/50 to-teal-500/40 flex items-center justify-center text-[#F3C77C] font-bold text-xs">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'K'}
                </div>
              )}
            </div>
          </button>

          <button
            id="burger-menu-btn"
            onClick={() => setIsAuthDrawerOpen(true)}
            className="flex items-center justify-center w-9 h-9 bg-[#131926] hover:bg-[#1A2337] text-slate-300 hover:text-white border border-[#232F44] rounded-xl shadow-xs transition-all active:scale-95"
            title={lang === 'ro' ? 'Meniu' : 'Menu'}
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-md sm:max-w-lg md:max-w-xl mx-auto space-y-4 relative z-10">
        {/* Visual Financial Reports & Analytics (3 Cards: Monthly Budget, Weekly Trends, Expense Breakdown) */}
        <FinancialCharts
          transactions={transactions}
          lang={lang}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          currency={currency}
        />

        {/* Big Luxury Gold 'Adăugare Nouă' Button matching screenshot theme */}
        <button
          id="add-new-entry-btn"
          onClick={() => handleOpenAddModal('expense')}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#F3C77C] via-[#E5B869] to-[#D4A247] hover:brightness-105 active:scale-[0.99] text-slate-950 font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/15 transition-all text-sm tracking-wide mb-4"
        >
          <div className="w-6 h-6 rounded-full bg-slate-950/15 flex items-center justify-center">
            <Plus size={16} className="text-slate-950 stroke-[3]" />
          </div>
          <span>{t.addNewEntry}</span>
        </button>

        {/* Reactive Transaction List with Gmail-style Swipe to Delete in Dark Theme */}
        <TransactionList
          transactions={transactions}
          onDelete={handleDeleteTransaction}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          lang={lang}
          currency={currency}
        />

        {/* Official Website Branding Footer */}
        <footer className="pt-6 pb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F3C77C]" />
            <a
              href="https://kaskaval.online"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-400 hover:text-[#F3C77C] transition-colors"
            >
              kaskaval.online
            </a>
            <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
          </div>
          <p className="text-[11px] text-slate-500">
            {lang === 'ro'
              ? 'Aplicație Financiară Inteligentă · Offline-First & Cloud'
              : 'Smart Personal Finance Tracker · Offline-First & Cloud'}
          </p>
        </footer>
      </main>

      {/* Gmail-style Undo Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#131926] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#253349] animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs">
          <span>{toastMessage}</span>
          {deletedTxBackup && (
            <button
              id="undo-delete-btn"
              onClick={handleUndoDelete}
              className="flex items-center gap-1 text-[#F3C77C] hover:text-amber-300 font-bold uppercase tracking-wider pl-2 border-l border-[#253349]"
            >
              <Undo2 size={13} />
              <span>{t.undo}</span>
            </button>
          )}
        </div>
      )}

      {/* Add Transaction Dialog */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        defaultType={modalTransactionType}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddTransaction}
        lang={lang}
        currency={currency}
      />

      {/* Auth & Cloud Sync Drawer (Burger Menu) */}
      <AuthDrawer
        isOpen={isAuthDrawerOpen}
        onClose={() => setIsAuthDrawerOpen(false)}
        lang={lang}
        onLanguageChange={(newLang) => setLang(newLang)}
        chartStyle={chartStyle}
        onChartStyleChange={(newStyle) => {
          setChartStyle(newStyle);
          localStorage.setItem('preferred_chart_style', newStyle);
        }}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MoneyTrackerApp />
      <Analytics />
    </AuthProvider>
  );
}
