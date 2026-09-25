import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useApp();
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!settings.showMobileShell) {
    // Full width responsive layout mode
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <div className="w-full max-w-xl mx-auto px-4">{children}</div>
      </div>
    );
  }

  // Mobile smartphone frame preview mode (on desktop, or natural full-width on mobile screens)
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center sm:py-6 sm:px-4">
      {/* Smartphone Device Frame */}
      <div className="w-full sm:max-w-[420px] sm:h-[890px] h-screen bg-slate-950 sm:rounded-[48px] sm:border-[9px] sm:border-slate-800 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col relative overflow-hidden sm:ring-1 sm:ring-slate-700/60">
        
        {/* Dynamic Island / Speaker Notch on mobile frame */}
        <div className="hidden sm:flex absolute top-3 left-1/2 -translate-x-1/2 z-50 items-center justify-between px-3 h-6 w-28 bg-black rounded-full border border-slate-800/80">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800/80 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900/60" />
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>

        {/* Realistic Mobile Top Status Bar */}
        <div className="hidden sm:flex items-center justify-between px-7 pt-3.5 pb-1 text-[11px] font-semibold text-slate-300 z-40 bg-slate-950 select-none">
          <span className="font-mono tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Scrollable Mobile Screen Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col px-4 pt-1">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="hidden sm:flex justify-center pb-2 pt-1 bg-slate-950 z-40 pointer-events-none select-none">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
