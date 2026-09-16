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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed on phone)
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(checkStandalone);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // If already opened as installed standalone app or user dismissed the prompt, hide banner
  if (isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction for mobile browsers
      alert(
        lang === 'ro'
          ? 'Apasă pe meniul cu 3 puncte (⋮) din dreapta-sus a browserului și alege „Instalează aplicația” (sau „Adaugă pe ecranul de pornire”). Astfel bara de browser va dispărea complet!'
          : 'Tap the 3 dots menu (⋮) at the top right of your browser and select "Install app" (or "Add to Home screen") to run full-screen without the URL bar!'
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto mb-3 px-2">
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white p-3 sm:p-3.5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-amber-300" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold truncate">
              {lang === 'ro' ? 'Vrei fără bara de browser sus?' : 'Want to hide the browser bar?'}
            </p>
            <p className="text-[11px] text-indigo-100 truncate">
              {lang === 'ro' ? 'Instalează pe ecran pentru ecran complet' : 'Install to home screen for fullscreen'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 bg-white text-indigo-700 hover:bg-indigo-50 active:scale-95 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Download size={14} />
            <span>{lang === 'ro' ? 'Instalează' : 'Install'}</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-indigo-200 hover:text-white rounded-lg transition-colors"
            title="Închide"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
