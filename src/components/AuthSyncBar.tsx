import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, RefreshCw, User as UserIcon, ShieldAlert } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n';

interface AuthSyncBarProps {
  lang: Language;
}

export const AuthSyncBar: React.FC<AuthSyncBarProps> = ({ lang }) => {
  const { user, loginWithGoogle, loginAsGuest, logout, syncStatus, syncNow } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const t = TRANSLATIONS[lang];

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
    <div id="auth-sync-bar" className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl mb-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-indigo-400"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                  <UserIcon size={12} />
                </div>
              )}
              <div className="leading-tight">
                <span className="font-semibold text-slate-100 block">
                  {user.displayName || (user.isAnonymous ? t.anonymousSession : user.email?.split('@')[0])}
                </span>
                <span className="text-[10px] text-slate-400">
                  {user.isAnonymous ? t.anonymousSession : t.firebaseSynced}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{t.offlineLocalMode}</span>
            </div>
          )}
        </div>

        {/* Sync Status & Action Buttons */}
        <div className="flex items-center gap-2">
          {user && !user.isAnonymous && (
            <button
              id="sync-now-button"
              onClick={syncNow}
              disabled={syncStatus === 'syncing'}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
              title="Sync Room DB with Firestore"
            >
              <RefreshCw
                size={12}
                className={syncStatus === 'syncing' ? 'animate-spin text-indigo-400' : 'text-slate-400'}
              />
              <span className="text-[11px]">
                {syncStatus === 'syncing' ? t.syncing : syncStatus === 'synced' ? t.synced : t.sync}
              </span>
            </button>
          )}

          {user ? (
            <button
              id="logout-btn"
              onClick={logout}
              className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <LogOut size={12} />
              <span className="text-[11px]">{t.signOut}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                id="login-guest-btn"
                onClick={handleGuestLogin}
                disabled={isProcessing}
                className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                {t.guestMode}
              </button>
              <button
                id="login-google-btn"
                onClick={handleGoogleLogin}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-xs transition-colors"
              >
                <LogIn size={12} />
                <span>{t.googleSignIn}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {authError && (
        <div className="mt-2 p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-[11px] flex items-center gap-1.5">
          <ShieldAlert size={12} className="shrink-0" />
          <span>{authError}</span>
        </div>
      )}
    </div>
  );
};
