import React from 'react';
import { LayoutDashboard, ReceiptText, Calculator, PieChart, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, setIsAddExpenseOpen } = useApp();

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    { id: 'emi', label: 'EMI Loan', icon: Calculator },
    { id: 'insights', label: 'Insights', icon: PieChart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 pb-safe">
      <div className="max-w-md mx-auto h-16 flex items-center justify-around relative">
        {/* Left two tabs */}
        {tabs.slice(0, 2).map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-400' : ''}`} />
              <span className="text-[11px] tracking-tight mt-1">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
          );
        })}

        {/* Central Floating Quick (+) Action */}
        <div className="flex-shrink-0 px-1 -mt-5">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            aria-label="Add New Expense"
            className="w-13 h-13 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all"
            title="Log Expense"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Right two tabs */}
        {tabs.slice(2, 4).map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center transition-colors relative ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-400' : ''}`} />
              <span className="text-[11px] tracking-tight mt-1">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
