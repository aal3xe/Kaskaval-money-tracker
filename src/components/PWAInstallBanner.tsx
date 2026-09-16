import React, { useEffect, useState } from 'react';
import { Download, Sparkles, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAInstallBannerProps {
  lang: 'ro' | 'en';
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    (window as unknown as { __deferredPrompt?: BeforeInstallPromptEvent }).__deferredPrompt || null
  );
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showHelperModal, setShowHelperModal] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed on phone)
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(checkStandalone);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as unknown as { __deferredPrompt?: BeforeInstallPromptEvent }).__deferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handlePromptReady = () => {
      const stored = (window as unknown as { __deferredPrompt?: BeforeInstallPromptEvent }).__deferredPrompt;
      if (stored) {
        setDeferredPrompt(stored);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);

    // Initial check in case it was captured before React hydration
    if ((window as unknown as { __deferredPrompt?: BeforeInstallPromptEvent }).__deferredPrompt) {
      setDeferredPrompt((window as unknown as { __deferredPrompt?: BeforeInstallPromptEvent }).__deferredPrompt!);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
    };
  }, []);

  // If already opened as installed standalone app or user dismissed the prompt, hide banner
  if (isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    const promptToUse =
      deferredPrompt ||
      (window as unknown as { __deferredPrompt?: BeforeInstallPromptEvent }).__deferredPrompt;

    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const choice = await promptToUse.userChoice;
        if (choice.outcome === 'accepted') {
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
        (window as unknown as { __deferredPrompt?: BeforeInstallPromptEvent | null }).__deferredPrompt = null;
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowHelperModal(true);
      }
    } else {
      setShowHelperModal(true);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto mb-3 px-2">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 via-indigo-600 to-indigo-700 text-white p-3 sm:p-3.5 rounded-2xl shadow-sm border border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/pwa-192x192.png"
              alt="MoneyFly"
              className="w-9 h-9 rounded-xl shadow-xs shrink-0 object-cover border border-white/20"
            />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold truncate flex items-center gap-1.5">
                <span>{lang === 'ro' ? 'Instalează MoneyFly pe ecran' : 'Install MoneyFly on home screen'}</span>
                <span className="text-[10px] bg-emerald-400/30 text-emerald-100 font-bold px-1.5 py-0.5 rounded-md">
                  Fullscreen
                </span>
              </p>
              <p className="text-[11px] text-indigo-100 truncate">
                {lang === 'ro' ? 'Fără bara de browser, ca o aplicație nativă' : 'No URL bar, pure native app look'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 bg-white text-indigo-700 hover:bg-emerald-50 active:scale-95 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Download size={14} className="text-indigo-600" />
              <span>{lang === 'ro' ? 'Instalează' : 'Install'}</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-indigo-200 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Închide"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Helper Modal if the browser requires manual step */}
      {showHelperModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl text-slate-800 animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <img src="/pwa-192x192.png" alt="MoneyFly" className="w-8 h-8 rounded-xl object-cover" />
                <span className="font-bold text-slate-900">MoneyFly</span>
              </div>
              <button
                onClick={() => setShowHelperModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              {lang === 'ro'
                ? 'Pentru a elimina definitiv bara de browser de sus:'
                : 'To permanently remove the top browser bar:'}
            </p>

            <ol className="text-xs space-y-2.5 text-slate-700 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">1</span>
                <span>{lang === 'ro' ? 'Apasă pe cele 3 puncte (⋮) din colțul din dreapta-sus al browserului.' : 'Tap the 3 dots (⋮) in the top-right corner of Chrome.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
                <span>{lang === 'ro' ? 'Alege „Instalează aplicația” (sau „Adaugă pe ecranul de pornire”).' : 'Choose "Install app" (or "Add to Home screen").'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0">3</span>
                <span>{lang === 'ro' ? 'Deschide aplicația direct din ecranul telefonului!' : 'Launch it directly from your phone home screen!'}</span>
              </li>
            </ol>

            <button
              onClick={() => setShowHelperModal(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors"
            >
              {lang === 'ro' ? 'Am înțeles' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
