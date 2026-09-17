import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  LogIn,
  LogOut,
  RefreshCw,
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Globe,
  CircleDot,
  BarChart3,
  PieChart,
  Download,
  Smartphone,
  Coins,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n';
import { CurrencyCode, CURRENCIES } from '../utils/currency';

export type ChartStyle = 'categories' | 'linear';

interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLanguageChange: (newLang: Language) => void;
  chartStyle: ChartStyle;
  onChartStyleChange: (style: ChartStyle) => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onClearAllData: () => void;
}

export const AuthDrawer: React.FC<AuthDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  onLanguageChange,
  chartStyle,
  onChartStyleChange,
  currency,
  onCurrencyChange,
  onClearAllData,
}) => {
  const { user, loginWithGoogle, loginAsGuest, logout, syncStatus, syncNow, lastSyncTime } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      setIsProcessing(true);
      await loginWithGoogle();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Google sign-in popup failed or closed.';
      setAuthError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGuestLogin = () => {
    setAuthError(null);
    loginAsGuest();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        id="auth-drawer-backdrop"
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        id="auth-drawer-panel"
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl h-full flex flex-col p-6 z-10 transition-transform duration-300 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'ro' ? 'Cont & Sincronizare' : 'Account & Sync'}
              </h2>
            </div>
          </div>
          <button
            id="close-auth-drawer-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="py-6">
          {user ? (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-3 mb-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-indigo-500 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <UserIcon size={24} />
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {user.displayName || (user.isAnonymous ? t.anonymousSession : user.email?.split('@')[0])}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user.email || (user.isAnonymous ? (lang === 'ro' ? 'Stocare locală activă' : 'Local storage active') : '')}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={12} />
                    <span>{user.isAnonymous ? t.anonymousSession : t.firebaseSynced}</span>
                  </div>
                </div>
              </div>

              {/* Sync Actions for Google User */}
              {user && !user.isAnonymous && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                  <button
                    id="drawer-sync-now-btn"
                    onClick={syncNow}
                    disabled={syncStatus === 'syncing'}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-xl transition-colors text-xs"
                  >
                    <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                    <span>
                      {syncStatus === 'syncing' ? t.syncing : syncStatus === 'synced' ? t.synced : t.sync}
                    </span>
                  </button>
                  {lastSyncTime && (
                    <span className="text-[10px] text-center text-slate-400">
                      {lang === 'ro' ? 'Ultima sincronizare: ' : 'Last synced: '}
                      {lastSyncTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}

              {/* Sign out button */}
              <div className="mt-3">
                <button
                  id="drawer-logout-btn"
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 px-3 rounded-xl transition-colors text-xs"
                >
                  <LogOut size={14} />
                  <span>{t.signOut}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto mb-2">
                  <UserIcon size={22} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                  {lang === 'ro' ? 'Niciun cont conectat' : 'Not signed in'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'ro'
                    ? 'Conectează-te cu Google pentru a salva tranzacțiile în Cloud sau continuă ca oaspete.'
                    : 'Sign in with Google to backup transactions to the Cloud or continue as guest.'}
                </p>
              </div>

              {/* Login Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  id="drawer-login-google-btn"
                  onClick={handleGoogleLogin}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition-colors text-xs"
                >
                  <LogIn size={15} />
                  <span>{t.googleSignIn}</span>
                </button>

                <button
                  id="drawer-login-guest-btn"
                  onClick={handleGuestLogin}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-colors text-xs"
                >
                  <UserIcon size={15} className="text-indigo-500" />
                  <span>{t.guestMode}</span>
                </button>
              </div>
            </div>
          )}

          {authError && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert size={15} className="shrink-0 text-rose-500" />
                <span>
                  {authError.includes('unauthorized-domain')
                    ? (lang === 'ro' ? 'Domeniu neautorizat în Firebase' : 'Unauthorized domain in Firebase')
                    : (lang === 'ro' ? 'Eroare de autentificare' : 'Authentication error')}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                {authError.includes('unauthorized-domain')
                  ? (lang === 'ro'
                    ? `Domeniul actual (${window.location.hostname}) trebuie adăugat în Firebase Console > Authentication > Settings > Authorized domains. Până atunci, folosește "Mod Oaspete" pentru funcționalitate completă!`
                    : `Current domain (${window.location.hostname}) must be added to Firebase Console > Authentication > Settings > Authorized domains. You can use "Guest Mode" for full functionality!`
                  )
                  : authError}
              </p>
              {authError.includes('unauthorized-domain') && (
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="mt-1 py-1.5 px-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 rounded-lg font-medium text-[11px] text-center transition-colors"
                >
                  {lang === 'ro' ? 'Activează Modul Oaspete acum' : 'Activate Guest Mode now'}
                </button>
              )}
            </div>
          )}

          {/* Chart Display Preference inside Drawer */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <PieChart size={14} className="text-indigo-500" />
                <span>{t.chartStyleSetting}</span>
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                id="drawer-chart-categories-btn"
                onClick={() => onChartStyleChange('categories')}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
                  chartStyle === 'categories'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CircleDot size={15} className={chartStyle === 'categories' ? 'text-indigo-600' : 'text-slate-400'} />
                  <span>{t.chartStyleCategories}</span>
                </div>
                {chartStyle === 'categories' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </button>

              <button
                id="drawer-chart-linear-btn"
                onClick={() => onChartStyleChange('linear')}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
                  chartStyle === 'linear'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 size={15} className={chartStyle === 'linear' ? 'text-indigo-600' : 'text-slate-400'} />
                  <span>{t.chartStyleLinear}</span>
                </div>
                {chartStyle === 'linear' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                )}
              </button>
            </div>
          </div>

          {/* Currency Selection inside Drawer */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Coins size={14} className="text-indigo-500" />
                <span>{t.currencySetting}</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                {currency} ({CURRENCIES[currency]?.symbol})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2.5">{t.currencySubtitle}</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((cCode) => {
                const item = CURRENCIES[cCode];
                const isSelected = currency === cCode;
                return (
                  <button
                    key={cCode}
                    id={`drawer-currency-${cCode.toLowerCase()}-btn`}
                    onClick={() => onCurrencyChange(cCode)}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.flag}</span>
                      <span>{cCode}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      {item.symbol}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selection inside Drawer */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe size={14} className="text-indigo-500" />
                <span>{lang === 'ro' ? 'Limbă aplicație' : 'App Language'}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                id="drawer-lang-ro-btn"
                onClick={() => onLanguageChange('ro')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  lang === 'ro'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🇷🇴 Română</span>
              </button>
              <button
                id="drawer-lang-en-btn"
                onClick={() => onLanguageChange('en')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  lang === 'en'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🇬🇧 English</span>
              </button>
            </div>
          </div>

          {/* Reset / Clear Data (Start from 0) */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            {!showClearConfirm ? (
              <button
                id="drawer-clear-all-data-btn"
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition-all"
              >
                <Trash2 size={14} />
                <span>{t.clearAllData}</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  <AlertTriangle size={15} className="shrink-0 text-rose-500" />
                  <span>{t.clearAllConfirm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="confirm-clear-all-btn"
                    onClick={() => {
                      onClearAllData();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    {lang === 'ro' ? 'Da, resetează la 0' : 'Yes, reset to 0'}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-300 transition-all"
                  >
                    {lang === 'ro' ? 'Anulează' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Install Kaskaval native button */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={async () => {
                const prompt = (window as unknown as { __deferredPrompt?: { prompt: () => Promise<void> } }).__deferredPrompt;
                if (prompt) {
                  try {
                    await prompt.prompt();
                  } catch (e) {
                    console.warn(e);
                  }
                } else {
                  alert(
                    lang === 'ro'
                      ? 'Dacă ești în Chrome pe telefon: apasă pe cele 3 puncte (⋮) din dreapta-sus a ecranului și alege „Instalează aplicația” (sau „Adaugă pe ecranul de pornire”).'
                      : 'In Chrome on phone: tap the 3 dots (⋮) in top-right and select "Install app".'
                  );
                }
              }}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white rounded-2xl shadow-sm hover:opacity-95 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <img src="/pwa-192x192.png" alt="Kaskaval" className="w-8 h-8 rounded-xl object-cover border border-white/30" />
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">
                    {lang === 'ro' ? 'Instalează Kaskaval' : 'Install Kaskaval'}
                  </p>
                  <p className="text-[10px] text-emerald-100">
                    {lang === 'ro' ? 'Ecran complet fără bara Chrome' : 'Fullscreen native app experience'}
                  </p>
                </div>
              </div>
              <Download size={16} className="text-white shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
