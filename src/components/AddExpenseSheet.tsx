import React, { useState } from 'react';
import { X, Check, Calendar, CreditCard, Banknote, Smartphone, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_CATEGORIES, formatCurrency } from '../utils/calculator';
import { PaymentMode } from '../types';
import { CategoryIcon } from './CategoryIcon';

export const AddExpenseSheet: React.FC = () => {
  const { isAddExpenseOpen, setIsAddExpenseOpen, addExpense, settings } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('groceries');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('card');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isAddExpenseOpen) return null;

  const isINR = settings.currencyCode === 'INR';
  const quickIncrements = isINR ? [100, 500, 1000, 2000] : [10, 25, 50, 100];

  const handleQuickAdd = (inc: number) => {
    const current = Number(amount) || 0;
    setAmount(String(current + inc));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    addExpense({
      title: title.trim(),
      amount: Math.round(numAmount),
      category,
      paymentMode,
      date,
      notes: notes.trim() || undefined,
    });

    // Reset & close
    setTitle('');
    setAmount('');
    setNotes('');
    setIsAddExpenseOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Grab handle */}
        <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto my-3 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-base font-bold text-white">Log Expense</h2>
          <button
            onClick={() => setIsAddExpenseOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">
          {/* Amount Input with big tabular figure */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">Amount</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold font-mono text-emerald-400">
                {settings.currencyCode === 'INR' ? '₹' : '$'}
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full h-14 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-800 text-2xl font-bold font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Quick increment chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              {quickIncrements.map(inc => (
                <button
                  type="button"
                  key={inc}
                  onClick={() => handleQuickAdd(inc)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-[11px] font-mono font-medium text-slate-300 active:scale-95 transition-all"
                >
                  +{formatCurrency(inc, settings.currencyCode, true)}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">Expense Description</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Weekly Supermarket, Electricity, Dinner"
              className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_CATEGORIES.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${cat.bgColor} ${cat.color} flex items-center justify-center mb-1`}>
                      <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-medium leading-tight truncate w-full">
                      {cat.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">Payment Method</label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMode('card')}
                className={`py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors ${
                  paymentMode === 'card' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors ${
                  paymentMode === 'upi' ? 'bg-slate-850 text-emerald-400 shadow-sm' : 'text-slate-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI/App</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors ${
                  paymentMode === 'cash' ? 'bg-slate-850 text-amber-400 shadow-sm' : 'text-slate-400'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('bank')}
                className={`py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-colors ${
                  paymentMode === 'bank' ? 'bg-slate-850 text-teal-400 shadow-sm' : 'text-slate-400'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Bank</span>
              </button>
            </div>
          </div>

          {/* Date & Note Row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 mb-1 block">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. split with friend"
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!title.trim() || !amount}
              className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
