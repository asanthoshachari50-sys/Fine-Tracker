import React from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Landmark,
  ArrowRight,
  Plus,
  Calculator,
  Sliders,
  Sparkles,
  Calendar,
  CheckCircle2,
  Receipt,
  PiggyBank,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatMonthName, getCurrentMonthKey } from '../utils/calculator';
import { DEFAULT_CATEGORIES } from '../utils/calculator';
import { CategoryIcon } from './CategoryIcon';

export const DashboardView: React.FC<{ onOpenBudget: () => void }> = ({ onOpenBudget }) => {
  const {
    expenses,
    loans,
    settings,
    setCurrentTab,
    setIsAddExpenseOpen,
    selectedMonth,
    setActiveAmortizationLoan,
    setIsAmortizationOpen,
  } = useApp();

  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

  const totalSpent = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalActiveLoansEmi = loans.reduce((sum, l) => sum + l.emiAmount, 0);

  const budgetLimit = settings.monthlyBudget;
  const monthlyIncome = settings.monthlyIncome;
  
  const budgetSpentRatio = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0;
  const remainingBudget = budgetLimit > 0 ? Math.max(0, budgetLimit - totalSpent) : 0;
  const estimatedSavings = monthlyIncome > 0 ? monthlyIncome - totalSpent : 0;
  const savingsRate = monthlyIncome > 0 ? Math.round((estimatedSavings / monthlyIncome) * 100) : 0;

  // Recent 5 expenses
  const recentExpenses = [...currentMonthExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt)
    .slice(0, 5);

  const getCategoryInfo = (catId: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === catId) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
  };

  const isFreshState = expenses.length === 0 && loans.length === 0;

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Month context kicker */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-medium text-slate-400">Monthly Overview</span>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {formatMonthName(selectedMonth)}
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Monthly Income</span>
          {monthlyIncome > 0 ? (
            <div className="text-sm font-semibold font-mono text-emerald-400">
              {formatCurrency(monthlyIncome, settings.currencyCode)}
            </div>
          ) : (
            <button
              onClick={onOpenBudget}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium block"
            >
              + Set Income
            </button>
          )}
        </div>
      </div>

      {/* Primary Financial Card */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Total Monthly Outflow</span>
          <button
            onClick={onOpenBudget}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            {budgetLimit > 0 ? (
              <span>Limit: {formatCurrency(budgetLimit, settings.currencyCode, true)}</span>
            ) : (
              <span className="text-emerald-400">+ Set Target Limit</span>
            )}
            <Sliders className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Big Tabular Number */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {formatCurrency(totalSpent, settings.currencyCode)}
          </span>
          <span className="text-xs text-slate-400">total spent</span>
        </div>

        {/* Budget Progress Bar */}
        {budgetLimit > 0 ? (
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className={budgetSpentRatio > 90 ? 'text-rose-400 font-medium' : 'text-slate-400'}>
                {budgetSpentRatio.toFixed(0)}% of monthly budget
              </span>
              <span className="text-slate-300 font-mono">
                {remainingBudget > 0 ? (
                  <>
                    <span className="text-emerald-400">{formatCurrency(remainingBudget, settings.currencyCode)}</span> left
                  </>
                ) : (
                  <span className="text-rose-400">Budget exceeded</span>
                )}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetSpentRatio > 100
                    ? 'bg-rose-500'
                    : budgetSpentRatio > 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetSpentRatio)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">No monthly limit set yet</span>
            <button
              onClick={onOpenBudget}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Set Budget
            </button>
          </div>
        )}

        {/* Secondary metrics row */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
          <div>
            <span className="text-[11px] text-slate-400">Active EMIs</span>
            <div className="text-sm font-semibold font-mono text-teal-300">
              {formatCurrency(totalActiveLoansEmi, settings.currencyCode)}
              <span className="text-[10px] text-slate-400 font-normal ml-1">/mo</span>
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Net Estimated Savings</span>
            <div className={`text-sm font-semibold font-mono ${estimatedSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {monthlyIncome > 0 ? (
                <>
                  {formatCurrency(estimatedSavings, settings.currencyCode)}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">({savingsRate}%)</span>
                </>
              ) : (
                <span className="text-slate-400 text-xs">Set income</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="min-h-[48px] px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 active:scale-[0.98] transition-all flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100">Log Expense</div>
              <div className="text-[10px] text-slate-400">Track purchase</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setCurrentTab('emi')}
          className="min-h-[48px] px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-850 active:scale-[0.98] transition-all flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
              <Calculator className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100">EMI Planner</div>
              <div className="text-[10px] text-slate-400">Calculate loan</div>
            </div>
          </div>
        </button>
      </div>

      {/* Fresh Start Welcome Card if user hasn't added anything yet */}
      {isFreshState && (
        <div className="rounded-2xl p-5 bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Your Fresh Financial Canvas</h3>
              <p className="text-[11px] text-slate-400">Zero clutter. Start logging your genuine expenses and loans.</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div
              onClick={() => setIsAddExpenseOpen(true)}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-200 font-medium">Log an expense</span>
              </div>
              <span className="text-[11px] text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                + Add Now →
              </span>
            </div>

            <div
              onClick={() => setCurrentTab('emi')}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-teal-500/40 cursor-pointer transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Calculator className="w-4 h-4 text-teal-400" />
                <span className="text-slate-200 font-medium">Plan or calculate a loan EMI</span>
              </div>
              <span className="text-[11px] text-teal-400 group-hover:translate-x-0.5 transition-transform">
                Calculate →
              </span>
            </div>

            <div
              onClick={onOpenBudget}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <PiggyBank className="w-4 h-4 text-amber-400" />
                <span className="text-slate-200 font-medium">Configure monthly income & budget</span>
              </div>
              <span className="text-[11px] text-slate-400 group-hover:translate-x-0.5 transition-transform">
                Configure →
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Active Loans Commitment Summary (if user added loans) */}
      {loans.length > 0 && (
        <div className="rounded-2xl p-4 bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-semibold text-slate-200">Active Loan Commitments</span>
            </div>
            <button
              onClick={() => setCurrentTab('emi')}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {loans.map(loan => (
              <div
                key={loan.id}
                onClick={() => {
                  setActiveAmortizationLoan(loan);
                  setIsAmortizationOpen(true);
                }}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-100">{loan.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {formatCurrency(loan.principal, settings.currencyCode, true)} · {loan.annualRate}% · {Math.round(loan.tenureMonths / 12)}y
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-teal-300">
                    {formatCurrency(loan.emiAmount, settings.currencyCode)}
                  </div>
                  <div className="text-[10px] text-slate-400">Monthly EMI</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="rounded-2xl p-4 bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-200">Recent Expenses</span>
          {currentMonthExpenses.length > 0 && (
            <button
              onClick={() => setCurrentTab('expenses')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-0.5"
            >
              <span>See all ({currentMonthExpenses.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-6 px-4 space-y-3">
            <p className="text-xs text-slate-400">No expenses recorded for {formatMonthName(selectedMonth)}.</p>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs active:scale-95 transition-transform"
            >
              + Log First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentExpenses.map(expense => {
              const cat = getCategoryInfo(expense.category);
              return (
                <div
                  key={expense.id}
                  className="py-3 flex items-center justify-between group hover:bg-slate-800/30 px-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${cat.bgColor} ${cat.color} flex items-center justify-center flex-shrink-0`}>
                      <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-100 line-clamp-1">
                        {expense.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{cat.name}</span>
                        <span>·</span>
                        <span className="capitalize">{expense.paymentMode}</span>
                        <span>·</span>
                        <span>{expense.date.split('-').slice(1).join('/')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-xs font-bold font-mono text-slate-100">
                      -{formatCurrency(expense.amount, settings.currencyCode)}
                    </div>
                    {expense.isRecurringEmi && (
                      <span className="text-[10px] text-teal-400 font-medium">EMI</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
