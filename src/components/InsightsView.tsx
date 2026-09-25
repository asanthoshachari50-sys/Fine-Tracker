import React, { useMemo } from 'react';
import {
  PieChart,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Download,
  Wallet,
  Landmark,
  CreditCard,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatMonthName, DEFAULT_CATEGORIES } from '../utils/calculator';
import { CategoryIcon } from './CategoryIcon';

export const InsightsView: React.FC = () => {
  const { expenses, loans, settings, selectedMonth } = useApp();

  const currentExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const totalSpent = useMemo(() => {
    return currentExpenses.reduce((s, i) => s + i.amount, 0);
  }, [currentExpenses]);

  const monthlyIncome = settings.monthlyIncome || 75000;
  const totalEmiSpent = useMemo(() => {
    return currentExpenses.filter(e => e.isRecurringEmi || e.category === 'emi_debt').reduce((s, i) => s + i.amount, 0);
  }, [currentExpenses]);

  // Debt-to-Income ratio (DTI)
  const dtiRatio = monthlyIncome > 0 ? (totalEmiSpent / monthlyIncome) * 100 : 0;

  // 50-30-20 Breakdown
  const needsSpent = useMemo(() => {
    return currentExpenses
      .filter(e => {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === e.category);
        return cat?.type === 'need';
      })
      .reduce((s, i) => s + i.amount, 0);
  }, [currentExpenses]);

  const wantsSpent = useMemo(() => {
    return currentExpenses
      .filter(e => {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === e.category);
        return cat?.type === 'want';
      })
      .reduce((s, i) => s + i.amount, 0);
  }, [currentExpenses]);

  const savingsAmount = Math.max(0, monthlyIncome - totalSpent);
  const needsPct = monthlyIncome > 0 ? (needsSpent / monthlyIncome) * 100 : 0;
  const wantsPct = monthlyIncome > 0 ? (wantsSpent / monthlyIncome) * 100 : 0;
  const savingsPct = monthlyIncome > 0 ? (savingsAmount / monthlyIncome) * 100 : 0;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: { [catId: string]: number } = {};
    currentExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === catId) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
        const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
        return { cat, amount, pct };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [currentExpenses, totalSpent]);

  // Payment Mode breakdown
  const paymentBreakdown = useMemo(() => {
    const map: { [mode: string]: number } = {};
    currentExpenses.forEach(e => {
      map[e.paymentMode] = (map[e.paymentMode] || 0) + e.amount;
    });

    return Object.entries(map)
      .map(([mode, amount]) => {
        const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
        return { mode, amount, pct };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [currentExpenses, totalSpent]);

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Month Context */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs text-slate-400">Financial Intelligence</span>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {formatMonthName(selectedMonth)}
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Savings Rate</span>
          <div className="text-sm font-bold font-mono text-emerald-400">
            {monthlyIncome > 0 ? `${savingsPct.toFixed(0)}%` : '—'}
          </div>
        </div>
      </div>

      {currentExpenses.length === 0 ? (
        <div className="rounded-2xl p-6 bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 mx-auto flex items-center justify-center">
            <PieChart className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Ready for your financial data</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              No transactions recorded for {formatMonthName(selectedMonth)} yet. Once you log expenses or save active loans, your 50/30/20 budget breakdown, debt-to-income ratio, and category analytics will calculate here automatically.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Debt-to-Income (DTI) Health Card */}
          <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-semibold text-slate-200">Debt Burden (DTI Ratio)</span>
              </div>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                  dtiRatio <= 35
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : dtiRatio <= 50
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                {monthlyIncome > 0 ? `${dtiRatio.toFixed(1)}% of income` : `${formatCurrency(totalEmiSpent, settings.currencyCode)} EMI`}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {monthlyIncome === 0
                ? 'Configure your monthly income in Settings to enable real-time Debt-to-Income safety ratio.'
                : dtiRatio <= 35
                ? 'Healthy debt position. Your monthly EMI commitments are safely below the recommended 35% threshold of income.'
                : dtiRatio <= 50
                ? 'Moderate debt position. Keep non-essential spending contained and prioritize prepaying higher-interest debts.'
                : 'Elevated debt level. More than half your monthly income goes toward loan EMIs. Focus on accelerated repayments.'}
            </p>

            {monthlyIncome > 0 && (
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dtiRatio <= 35 ? 'bg-emerald-500' : dtiRatio <= 50 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, dtiRatio)}%` }}
                />
              </div>
            )}
          </div>

          {/* 50-30-20 Financial Rule Benchmark */}
          {monthlyIncome > 0 && (
            <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">50 / 30 / 20 Budget Rule</span>
                </div>
                <span className="text-[11px] text-slate-400">Target Benchmark</span>
              </div>

              {/* Needs bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Needs (Essentials & Housing)</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(needsSpent, settings.currencyCode)}{' '}
                    <span className="text-slate-400">({needsPct.toFixed(0)}% / 50% target)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${needsPct > 55 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (needsPct / 50) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Wants bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Wants (Dining & Lifestyle)</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(wantsSpent, settings.currencyCode)}{' '}
                    <span className="text-slate-400">({wantsPct.toFixed(0)}% / 30% target)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${wantsPct > 35 ? 'bg-rose-400' : 'bg-blue-400'}`}
                    style={{ width: `${Math.min(100, (wantsPct / 30) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Savings & Debt bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Savings & EMI Repayments</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(savingsAmount + totalEmiSpent, settings.currencyCode)}{' '}
                    <span className="text-slate-400">({(savingsPct + dtiRatio).toFixed(0)}% / 20% target)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-400"
                    style={{ width: `${Math.min(100, ((savingsPct + dtiRatio) / 20) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category-Wise Breakdown List */}
          <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-200 block">
              Category Outflow Breakdown
            </span>

            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No categorized expenses in this month yet.</p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map(item => (
                  <div key={item.cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-md ${item.cat.bgColor} ${item.cat.color} flex items-center justify-center`}
                        >
                          <CategoryIcon iconName={item.cat.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-200 font-medium">{item.cat.name}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-white font-semibold">
                          {formatCurrency(item.amount, settings.currencyCode)}
                        </span>
                        <span className="text-slate-400 text-[11px] ml-1.5">({item.pct.toFixed(0)}%)</span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Channels */}
          {paymentBreakdown.length > 0 && (
            <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-200 block">
                Payment Mode Distribution
              </span>

              <div className="grid grid-cols-2 gap-2">
                {paymentBreakdown.map(item => (
                  <div key={item.mode} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 capitalize">{item.mode}</div>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      {formatCurrency(item.amount, settings.currencyCode)}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      {item.pct.toFixed(0)}% of total
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
