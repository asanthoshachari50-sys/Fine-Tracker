import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  Download,
  Plus,
  Landmark,
  X,
  CreditCard,
  Wallet,
  Smartphone,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatMonthName, DEFAULT_CATEGORIES } from '../utils/calculator';
import { CategoryIcon } from './CategoryIcon';
import { PaymentMode } from '../types';

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    deleteExpense,
    clearAllExpenses,
    settings,
    selectedMonth,
    setSelectedMonth,
    setIsAddExpenseOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'need' | 'want' | 'obligation'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);

  // Month navigation
  const handlePrevMonth = () => {
    const [yStr, mStr] = selectedMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setSelectedMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yStr, mStr] = selectedMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setSelectedMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  // Filtered expenses for month
  const monthExpenses = useMemo(() => {
    return expenses.filter(exp => exp.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    return monthExpenses.filter(exp => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = exp.title.toLowerCase().includes(q);
        const matchNotes = exp.notes?.toLowerCase().includes(q);
        const matchCategory = exp.category.toLowerCase().includes(q);
        if (!matchTitle && !matchNotes && !matchCategory) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) {
        return false;
      }

      // Payment Mode filter
      if (selectedPaymentMode !== 'all' && exp.paymentMode !== selectedPaymentMode) {
        return false;
      }

      // Type filter (Need / Want / Obligation)
      if (activeTypeFilter !== 'all') {
        const catInfo = DEFAULT_CATEGORIES.find(c => c.id === exp.category);
        if (catInfo && catInfo.type !== activeTypeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [monthExpenses, searchQuery, selectedCategory, selectedPaymentMode, activeTypeFilter]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { [dateStr: string]: typeof filteredExpenses } = {};
    const sorted = [...filteredExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt
    );

    sorted.forEach(exp => {
      if (!groups[exp.date]) {
        groups[exp.date] = [];
      }
      groups[exp.date].push(exp);
    });

    return groups;
  }, [filteredExpenses]);

  // Format date header
  const formatDateHeader = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';

    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getCategoryInfo = (catId: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === catId) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
  };

  const exportCSV = () => {
    if (monthExpenses.length === 0) return;
    const headers = ['Date', 'Title', 'Category', 'Payment Mode', 'Amount', 'Type', 'Notes'];
    const rows = monthExpenses.map(e => [
      e.date,
      `"${e.title.replace(/"/g, '""')}"`,
      e.category,
      e.paymentMode,
      e.amount,
      e.isRecurringEmi ? 'EMI' : 'Expense',
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinPulse_Expenses_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Month Navigator Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={handlePrevMonth}
          className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="text-sm font-bold text-white tracking-tight">
            {formatMonthName(selectedMonth)}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {monthExpenses.length} entries · {formatCurrency(monthExpenses.reduce((s, i) => s + i.amount, 0), settings.currencyCode)}
          </div>
        </div>

        <button
          onClick={handleNextMonth}
          className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors"
          aria-label="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by title, category, or notes..."
          className="w-full h-11 pl-10 pr-9 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Interactive Filter Controls */}
      <div className="space-y-2">
        {/* Needs / Wants / Obligations segmented button tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTypeFilter('all')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTypeFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTypeFilter('need')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTypeFilter === 'need'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Needs
          </button>
          <button
            onClick={() => setActiveTypeFilter('want')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTypeFilter === 'want'
                ? 'bg-slate-800 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wants
          </button>
          <button
            onClick={() => setActiveTypeFilter('obligation')}
            className={`flex-1 py-1.5 px-2.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTypeFilter === 'obligation'
                ? 'bg-slate-800 text-teal-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EMIs
          </button>
        </div>

        {/* Categories scrollable pill-free chip buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors border ${
              selectedCategory === 'all'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
          {DEFAULT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
              className={`h-8 px-3 rounded-lg font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Stats Bar & Export */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <div>
          <span>Showing </span>
          <span className="font-semibold text-slate-200">{filteredExpenses.length}</span>
          <span> expenses (</span>
          <span className="font-mono font-semibold text-emerald-400">
            {formatCurrency(totalFilteredAmount, settings.currencyCode)}
          </span>
          <span>)</span>
        </div>

        {monthExpenses.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              title="Download CSV Statement"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {showConfirmClearAll ? (
              <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-800/80 px-1.5 py-0.5 rounded-md">
                <span className="text-[10px] text-rose-300">Clear all?</span>
                <button
                  onClick={() => {
                    clearAllExpenses();
                    setShowConfirmClearAll(false);
                  }}
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-200 px-1"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirmClearAll(false)}
                  className="text-[10px] text-slate-400 hover:text-white px-1"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClearAll(true)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors"
                title="Clear all recorded expenses"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expense Grouped Feed */}
      {filteredExpenses.length === 0 ? (
        <div className="rounded-2xl p-8 bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-400">
            {monthExpenses.length === 0
              ? `No expenses recorded for ${formatMonthName(selectedMonth)}.`
              : 'No expenses match your search or filter.'}
          </p>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs active:scale-95 transition-transform"
          >
            + Add Expense
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDate).map(([dateStr, items]) => {
            const dayTotal = items.reduce((s, i) => s + i.amount, 0);

            return (
              <div key={dateStr} className="space-y-1.5">
                {/* Date Header */}
                <div className="flex items-center justify-between px-1 text-xs text-slate-400">
                  <span className="font-medium text-slate-300">{formatDateHeader(dateStr)}</span>
                  <span className="font-mono text-slate-400">
                    {formatCurrency(dayTotal, settings.currencyCode)}
                  </span>
                </div>

                {/* Items in date card */}
                <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                  {items.map(expense => {
                    const cat = getCategoryInfo(expense.category);
                    const isDeleting = deletingId === expense.id;

                    return (
                      <div
                        key={expense.id}
                        className="p-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Left category icon & title */}
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div
                            className={`w-10 h-10 rounded-xl ${cat.bgColor} ${cat.color} flex items-center justify-center flex-shrink-0`}
                          >
                            <CategoryIcon iconName={cat.icon} className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                              {expense.title}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                              <span>{cat.name}</span>
                              <span>·</span>
                              <span className="capitalize">{expense.paymentMode}</span>
                              {expense.notes && (
                                <>
                                  <span>·</span>
                                  <span className="truncate max-w-[120px]">{expense.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right amount and delete action */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-bold font-mono text-slate-100">
                              -{formatCurrency(expense.amount, settings.currencyCode)}
                            </div>
                            {expense.isRecurringEmi && (
                              <div className="text-[10px] text-teal-400 font-medium">EMI Loan</div>
                            )}
                          </div>

                          {/* Delete button with confirm state */}
                          {isDeleting ? (
                            <div className="flex items-center gap-1 pl-1">
                              <button
                                onClick={() => {
                                  deleteExpense(expense.id);
                                  setDeletingId(null);
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-semibold"
                              >
                                Del
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="px-1.5 py-1 bg-slate-800 text-slate-300 rounded text-[10px]"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(expense.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
