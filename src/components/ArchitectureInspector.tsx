import React, { useState } from 'react';
import { KOTLIN_ARCHITECTURE_FILES } from '../data/kotlinArchitectureData';
import { Code2, Database, Layers, GitBranch, Cpu, Check, Copy, Terminal } from 'lucide-react';
import { Language } from '../i18n';

interface ArchitectureInspectorProps {
  roomRecordCount: number;
  lang: Language;
}

export const ArchitectureInspector: React.FC<ArchitectureInspectorProps> = ({ roomRecordCount, lang }) => {
  const [selectedTab, setSelectedTab] = useState<keyof typeof KOTLIN_ARCHITECTURE_FILES>('Entity');
  const [copied, setCopied] = useState(false);

  const activeModule = KOTLIN_ARCHITECTURE_FILES[selectedTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeModule.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="architecture-inspector" className="bg-slate-900 text-slate-100 rounded-2xl p-4 shadow-sm border border-slate-800 mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Cpu size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">
                {lang === 'ro' ? 'Arhitectură Android Kotlin & Jetpack Compose' : 'Android Kotlin & Jetpack Architecture'}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded-sm">
                Clean Arch + Hilt
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'ro'
                ? `Bază de date locală Room (${roomRecordCount} înregistrări) • Dagger Hilt DI • Firebase Sync`
                : `Live Room DB (${roomRecordCount} records) • Dagger Hilt DI • Firebase Sync`}
            </p>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? (lang === 'ro' ? 'Copiat' : 'Copied') : (lang === 'ro' ? 'Copiază Sursa' : 'Copy Source')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto py-3 no-scrollbar border-b border-slate-800/80">
        {(Object.keys(KOTLIN_ARCHITECTURE_FILES) as Array<keyof typeof KOTLIN_ARCHITECTURE_FILES>).map(key => {
          const isActive = selectedTab === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedTab(key)}
              className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {key === 'HiltModule' ? 'Hilt DI' : key === 'ComposeScreen' ? 'Compose UI' : key}
            </button>
          );
        })}
      </div>

      {/* File Path & Description */}
      <div className="py-2 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1 font-mono text-slate-300 truncate">
          <Terminal size={12} className="text-indigo-400 shrink-0" />
          <span className="truncate">{activeModule.path}</span>
        </div>
        <span className="text-slate-400 text-right hidden sm:inline">{activeModule.description}</span>
      </div>

      {/* Code Viewer */}
      <div className="relative mt-1 bg-slate-950 rounded-xl p-3 font-mono text-xs overflow-x-auto border border-slate-800/60 max-h-72">
        <pre className="text-slate-300 leading-relaxed">
          <code>{activeModule.code}</code>
        </pre>
      </div>

      {/* Architectural Stack Badges */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/60 text-[11px]">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
          <Database size={12} className="text-amber-400" />
          <span>Room 2.6 (SQLite)</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
          <Layers size={12} className="text-cyan-400" />
          <span>Dagger Hilt 2.51</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
          <Code2 size={12} className="text-violet-400" />
          <span>Jetpack Compose BOM</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
          <GitBranch size={12} className="text-emerald-400" />
          <span>StateFlow & Coroutines</span>
        </div>
      </div>
    </div>
  );
};
