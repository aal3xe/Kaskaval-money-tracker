import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from './types';
import { RoomDatabaseEmulator } from './data/roomDatabase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthDrawer, ChartStyle } from './components/AuthDrawer';
import { FinancialCharts } from './components/FinancialCharts';
import { TransactionList } from './components/TransactionList';
import { AddTransactionModal } from './components/AddTransactionModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Language, TRANSLATIONS } from './i18n';
import {
  Wallet,
  Plus,
  Undo2,
  Menu
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function MoneyTrackerApp() {
  // Primary language default to Romanian ('ro') with English ('en') toggle
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('money_tracker_lang') as Language) || 'ro';
  });

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
    <div className="min-h-screen bg-slate-100 text-slate-800 antialiased py-4 sm:py-8 px-2 sm:px-4">
      {/* Top Header Bar */}
      <header className="max-w-5xl mx-auto mb-4 flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2.5">
          <img
            src="/pwa-192x192.png"
            alt="MoneyFly"
            className="w-9 h-9 rounded-xl shadow-md object-cover border border-slate-200/60"
          />
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">{t.appTitle}</h1>
          </div>
        </div>

        {/* Action Controls: Minimal Burger Menu Icon Button */}
        <div className="flex items-center">
          <button
            id="burger-menu-btn"
            onClick={() => setIsAuthDrawerOpen(true)}
            className="flex items-center justify-center w-10 h-10 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all active:scale-95"
            title={lang === 'ro' ? 'Meniu' : 'Menu'}
            aria-label="Menu"
          >
            <Menu size={20} className="text-slate-700" />
          </button>
        </div>
      </header>

      {/* PWA Mobile Fullscreen Install Banner */}
      <PWAInstallBanner lang={lang} />

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto">
        {/* Android App Surface (Material 3 Theme) */}
        <div
          id="android-app-container"
          className="w-full bg-slate-50/90 rounded-[28px] overflow-hidden p-4 sm:p-6"
        >
          {/* Visual Financial Reports & Analytics (Piechart Donut & Venituri/Cheltuieli) */}
          <FinancialCharts
            transactions={transactions}
            lang={lang}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            chartStyle={chartStyle}
          />

          {/* Un singur buton mare cu numele 'Adăugare Nouă' pe fundal în două culori (verde și roșu) */}
          <button
            id="add-new-entry-btn"
            onClick={() => handleOpenAddModal('expense')}
            className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500/80 to-rose-600 hover:brightness-105 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-base mb-5"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Plus size={16} className="stroke-[3]" />
            </div>
            <span>{t.addNewEntry}</span>
          </button>

          {/* Reactive Transaction List with Gmail-style Swipe to Delete */}
          <TransactionList
            transactions={transactions}
            onDelete={handleDeleteTransaction}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            lang={lang}
          />
        </div>
      </main>

      {/* Gmail-style Undo Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs">
          <span>{toastMessage}</span>
          {deletedTxBackup && (
            <button
              id="undo-delete-btn"
              onClick={handleUndoDelete}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider pl-2 border-l border-slate-700"
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
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MoneyTrackerApp />
    </AuthProvider>
  );
}
