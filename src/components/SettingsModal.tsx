import React, { useState } from 'react';
import { X, Check, RotateCcw, Trash2, Coins, DollarSign, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRENCIES, formatCurrency } from '../utils/calculator';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, clearAllData } = useApp();

  const [income, setIncome] = useState(String(settings.monthlyIncome || ''));
  const [budget, setBudget] = useState(String(settings.monthlyBudget || ''));
  const [currency, setCurrency] = useState(settings.currencyCode);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings({
      monthlyIncome: Math.max(0, Number(income) || 0),
      monthlyBudget: Math.max(0, Number(budget) || 0),
      currencyCode: currency,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white">Settings & Budget</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Currency Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-400 block">Currency</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(CURRENCIES).map(c => {
              const isSelected = currency === c.code;
              return (
                <button
                  type="button"
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`h-11 px-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="font-mono font-bold text-emerald-400 ml-1">{c.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Monthly Income */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-400 block">Monthly Income</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
              {CURRENCIES[currency]?.symbol || '$'}
            </span>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={income}
              onChange={e => setIncome(e.target.value)}
              className="w-full h-11 pl-8 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Monthly Budget Target */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-400 block">Monthly Outflow Target Limit</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
              {CURRENCIES[currency]?.symbol || '$'}
            </span>
            <input
              type="number"
              placeholder="e.g. 30000"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="w-full h-11 pl-8 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Data Reset & Fresh Starter Data */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-medium text-slate-400 block">Data Controls</span>

          {confirmClear ? (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-center">
              <p className="text-[11px] text-rose-300 font-medium">Clear all expenses and saved loans?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearAllData();
                    setConfirmClear(false);
                    onClose();
                  }}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
                >
                  Yes, Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-rose-400 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Expenses & Loans</span>
            </button>
          )}
        </div>

        {/* Save CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
