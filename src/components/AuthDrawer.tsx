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
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        id="auth-drawer-panel"
        className="relative w-full max-w-sm bg-[#0E1422] border-l border-[#222E42] text-slate-100 shadow-2xl h-full flex flex-col p-6 z-10 transition-transform duration-300 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222E42]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F3C77C] to-[#E5B869] text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {lang === 'ro' ? 'Cont & Setări' : 'Account & Settings'}
              </h2>
            </div>
          </div>
          <button
            id="close-auth-drawer-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="py-5">
          {user ? (
            <div className="bg-[#131926] rounded-2xl p-4 border border-[#222E42]">
              <div className="flex items-center gap-3 mb-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-[#F3C77C] shadow-md object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#1A2337] border border-[#F3C77C]/60 text-[#F3C77C] flex items-center justify-center font-bold text-lg">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon size={22} />}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="font-semibold text-white text-sm truncate">
                    {user.displayName || (user.isAnonymous ? t.anonymousSession : user.email?.split('@')[0])}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {user.email || (user.isAnonymous ? (lang === 'ro' ? 'Stocare locală activă' : 'Local storage active') : '')}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#2DD4BF]">
                    <CheckCircle2 size={12} />
                    <span>{user.isAnonymous ? t.anonymousSession : t.firebaseSynced}</span>
                  </div>
                </div>
              </div>

              {/* Sync Actions for Google User */}
              {user && !user.isAnonymous && (
                <div className="pt-3 border-t border-[#222E42] flex flex-col gap-2">
                  <button
                    id="drawer-sync-now-btn"
                    onClick={syncNow}
                    disabled={syncStatus === 'syncing'}
                    className="w-full flex items-center justify-center gap-2 bg-[#F3C77C] hover:bg-[#E5B869] text-slate-950 font-bold py-2 px-3 rounded-xl transition-colors text-xs"
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
                  className="w-full flex items-center justify-center gap-2 bg-[#1A2337] hover:bg-[#25324E] text-slate-300 hover:text-white font-medium py-2 px-3 rounded-xl border border-[#26354D] transition-colors text-xs"
                >
                  <LogOut size={14} />
                  <span>{t.signOut}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#131926] p-4 rounded-2xl border border-[#222E42] text-center">
                <div className="w-12 h-12 rounded-full bg-[#1A2337] text-slate-400 flex items-center justify-center mx-auto mb-2 border border-[#2B3950]">
                  <UserIcon size={22} />
                </div>
                <h3 className="font-semibold text-white text-sm">
                  {lang === 'ro' ? 'Niciun cont conectat' : 'Not signed in'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ro'
                    ? 'Conectează-te cu Google pentru a salva tranzacțiile în Cloud sau continuă ca oaspete.'
                    : 'Sign in with Google to backup transactions to Cloud or continue as guest.'}
                </p>
              </div>

              {/* Login Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  id="drawer-login-google-btn"
                  onClick={handleGoogleLogin}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#F3C77C] to-[#E5B869] text-slate-950 font-bold rounded-xl shadow-xs transition-colors text-xs"
                >
                  <LogIn size={15} />
                  <span>{t.googleSignIn}</span>
                </button>

                <button
                  id="drawer-login-guest-btn"
                  onClick={handleGuestLogin}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#182030] hover:bg-[#222E44] text-slate-200 font-medium rounded-xl border border-[#26364E] transition-colors text-xs"
                >
                  <UserIcon size={15} className="text-[#F3C77C]" />
                  <span>{t.guestMode}</span>
                </button>
              </div>
            </div>
          )}

          {authError && (
            <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert size={15} className="shrink-0 text-rose-400" />
                <span>
                  {authError.includes('unauthorized-domain')
                    ? (lang === 'ro' ? 'Domeniu neautorizat în Firebase' : 'Unauthorized domain in Firebase')
                    : (lang === 'ro' ? 'Eroare de autentificare' : 'Authentication error')}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
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
                  className="mt-1 py-1.5 px-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg font-medium text-[11px] text-center transition-colors"
                >
                  {lang === 'ro' ? 'Activează Modul Oaspete acum' : 'Activate Guest Mode now'}
                </button>
              )}
            </div>
          )}

          {/* Currency Selection inside Drawer */}
          <div className="mt-6 pt-5 border-t border-[#222E42]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Coins size={14} className="text-[#F3C77C]" />
                <span>{t.currencySetting}</span>
              </span>
              <span className="text-[11px] font-bold text-[#F3C77C] bg-[#1A2337] px-2 py-0.5 rounded-md border border-[#2B3952]">
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
                        ? 'bg-[#F3C77C]/15 border-[#F3C77C] text-[#F3C77C] shadow-xs'
                        : 'bg-[#131926] border-[#222E42] text-slate-300 hover:border-[#354562]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.flag}</span>
                      <span>{cCode}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.symbol}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selection inside Drawer */}
          <div className="mt-6 pt-5 border-t border-[#222E42]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe size={14} className="text-[#F3C77C]" />
                <span>{lang === 'ro' ? 'Limbă aplicație' : 'App Language'}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-[#131926] p-1 rounded-xl border border-[#222E42]">
              <button
                id="drawer-lang-en-btn"
                onClick={() => onLanguageChange('en')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  lang === 'en'
                    ? 'bg-[#F3C77C] text-slate-950 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🇬🇧 English</span>
              </button>
              <button
                id="drawer-lang-ro-btn"
                onClick={() => onLanguageChange('ro')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  lang === 'ro'
                    ? 'bg-[#F3C77C] text-slate-950 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🇷🇴 Română</span>
              </button>
            </div>
          </div>

          {/* Reset / Clear Data (Start from 0) */}
          <div className="mt-6 pt-5 border-t border-[#222E42]">
            {!showClearConfirm ? (
              <button
                id="drawer-clear-all-data-btn"
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 text-xs font-semibold transition-all"
              >
                <Trash2 size={14} />
                <span>{t.clearAllData}</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                  <AlertTriangle size={15} className="shrink-0 text-rose-400" />
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
                    className="px-3 py-1.5 bg-[#182030] text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-[#25344C] transition-all"
                  >
                    {lang === 'ro' ? 'Anulează' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Install Kaskaval native application button */}
          <div className="mt-6 pt-5 border-t border-[#222E42]">
            <button
              id="drawer-install-app-btn"
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
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-[#182233] to-[#212E44] border border-[#2C3E5A] hover:border-[#F3C77C] text-white rounded-2xl shadow-sm transition-all group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <img
                  src="/pwa-192x192.png"
                  alt="Kaskaval"
                  className="w-9 h-9 rounded-xl object-cover border border-[#F3C77C]/40 shrink-0"
                />
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight text-[#F3C77C] group-hover:text-amber-300 transition-colors">
                    {lang === 'ro' ? 'Instalează Aplicația' : 'Install Application'}
                  </p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">
                    {lang === 'ro' ? 'Ecran complet nativ fără bara Chrome' : 'Fullscreen native app experience'}
                  </p>
                </div>
              </div>
              <Download size={18} className="text-[#F3C77C] shrink-0 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
