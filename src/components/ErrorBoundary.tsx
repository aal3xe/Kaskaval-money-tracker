import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  // Declare properties explicitly
  declare props: Readonly<Props>;
  declare state: Readonly<State>;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in Kaskaval:', error, errorInfo);
  }

  private handleHardReset = () => {
    // Clear potential corrupted caches or worker registrations
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
    }
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-5 border border-rose-500/30">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mb-2">
            Reîmprospătare necesară
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
            Aplicația s-a actualizat recent. Apasă pe butonul de mai jos pentru a reîncărca versiunea nouă și a curăța cache-ul vechi.
          </p>
          <button
            onClick={this.handleHardReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-medium text-sm shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Reîncarcă și curăță cache-ul
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
