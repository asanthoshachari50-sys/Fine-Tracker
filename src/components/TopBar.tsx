import React from 'react';
import { Settings2, Smartphone, Monitor } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRENCIES } from '../utils/calculator';

interface TopBarProps {
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSettings }) => {
  const { settings, updateSettings } = useApp();
  const currentCurrency = CURRENCIES[settings.currencyCode] || CURRENCIES.INR;

  return (
    <header className="sticky top-0 z-30 px-3.5 py-3 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 inline-block"></span>
            FinPulse
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            · Mobile Finance
          </span>
        </div>

        {/* Zone 2 & 3: Functional actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Currency Selector */}
          <button
            onClick={onOpenSettings}
            className="h-9 px-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1 transition-colors"
            title="Change Currency & Settings"
          >
            <span className="text-emerald-400 font-mono font-semibold">{currentCurrency.symbol}</span>
            <span className="text-slate-400 text-[11px]">{currentCurrency.code}</span>
          </button>

          {/* Toggle Mobile Frame (visible on desktop) */}
          <button
            onClick={() => updateSettings({ showMobileShell: !settings.showMobileShell })}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={settings.showMobileShell ? 'Switch to Full Screen View' : 'Switch to Smartphone Frame View'}
          >
            {settings.showMobileShell ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="App Settings & Budget"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
