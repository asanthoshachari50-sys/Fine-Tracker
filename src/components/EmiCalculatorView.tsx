import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Landmark,
  Calendar,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Table,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Percent,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateEMI, formatCurrency, generateAmortizationSchedule } from '../utils/calculator';
import { Loan, LoanCategory } from '../types';

interface PresetOption {
  name: string;
  category: LoanCategory;
  inrPrincipal: number;
  usdPrincipal: number;
  rate: number;
  tenureYears: number;
}

const PRESETS: PresetOption[] = [
  { name: 'Home Loan', category: 'home', inrPrincipal: 3500000, usdPrincipal: 250000, rate: 8.5, tenureYears: 20 },
  { name: 'Car Loan', category: 'car', inrPrincipal: 650000, usdPrincipal: 28000, rate: 8.9, tenureYears: 5 },
  { name: 'Personal Loan', category: 'personal', inrPrincipal: 250000, usdPrincipal: 10000, rate: 12.0, tenureYears: 3 },
  { name: 'Education Loan', category: 'education', inrPrincipal: 1000000, usdPrincipal: 40000, rate: 9.5, tenureYears: 7 },
  { name: 'Electronics / Gadget', category: 'gadget', inrPrincipal: 85000, usdPrincipal: 1200, rate: 14.0, tenureYears: 1 },
];

export const EmiCalculatorView: React.FC = () => {
  const {
    settings,
    loans,
    addLoan,
    deleteLoan,
    linkLoanToExpenses,
    setActiveAmortizationLoan,
    setIsAmortizationOpen,
  } = useApp();

  const isINR = settings.currencyCode === 'INR';

  // Calculator State
  const [loanName, setLoanName] = useState('');
  const [loanCategory, setLoanCategory] = useState<LoanCategory>('car');
  const [principal, setPrincipal] = useState<number>(isINR ? 500000 : 25000);
  const [annualRate, setAnnualRate] = useState<number>(9.0);
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [tenureValue, setTenureValue] = useState<number>(5);

  // Prepayment Simulator Toggle & Inputs
  const [showPrepayment, setShowPrepayment] = useState(false);
  const [extraMonthly, setExtraMonthly] = useState<number>(0);
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(0);
  const [lumpSumMonth, setLumpSumMonth] = useState<number>(12);

  // Success notification
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const tenureMonths = useMemo(() => {
    return tenureUnit === 'years' ? tenureValue * 12 : tenureValue;
  }, [tenureUnit, tenureValue]);

  // Calculations
  const emiResult = useMemo(() => {
    return calculateEMI(principal, annualRate, tenureMonths);
  }, [principal, annualRate, tenureMonths]);

  // Prepayment simulation
  const amortizationSummary = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return generateAmortizationSchedule(
      principal,
      annualRate,
      tenureMonths,
      todayStr,
      extraMonthly,
      lumpSumAmount,
      lumpSumMonth
    );
  }, [principal, annualRate, tenureMonths, extraMonthly, lumpSumAmount, lumpSumMonth]);

  // Donut chart calculations
  const principalPercent = emiResult.totalPayment > 0 ? (principal / emiResult.totalPayment) * 100 : 0;
  const interestPercent = emiResult.totalPayment > 0 ? (emiResult.totalInterest / emiResult.totalPayment) * 100 : 0;

  // Preset selector handler
  const applyPreset = (preset: PresetOption) => {
    setLoanName(preset.name);
    setLoanCategory(preset.category);
    setPrincipal(isINR ? preset.inrPrincipal : preset.usdPrincipal);
    setAnnualRate(preset.rate);
    setTenureUnit('years');
    setTenureValue(preset.tenureYears);
  };

  // Add this calculated loan to the user's tracker
  const handleSaveAndAddToExpenses = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const createdLoan = addLoan({
      name: loanName || 'Active Loan',
      category: loanCategory,
      principal,
      annualRate,
      tenureMonths,
      emiAmount: emiResult.emi,
      totalInterest: emiResult.totalInterest,
      totalPayment: emiResult.totalPayment,
      startDate: todayStr,
      isLinkedToExpenses: true,
      notes: `${annualRate}% for ${tenureMonths} months`,
    });

    linkLoanToExpenses(createdLoan.id);

    setAddedToast(`Added ${createdLoan.name} (EMI: ${formatCurrency(emiResult.emi, settings.currencyCode)}) to Monthly Expenses!`);
    setTimeout(() => {
      setAddedToast(null);
    }, 3500);
  };

  const handleOpenAmortization = () => {
    const tempLoan: Loan = {
      id: 'current_calc',
      name: loanName,
      category: loanCategory,
      principal,
      annualRate,
      tenureMonths,
      emiAmount: emiResult.emi,
      totalInterest: emiResult.totalInterest,
      totalPayment: emiResult.totalPayment,
      startDate: new Date().toISOString().split('T')[0],
    };
    setActiveAmortizationLoan(tempLoan);
    setIsAmortizationOpen(true);
  };

  // Quick increment buttons
  const stepAmount = isINR ? 50000 : 2000;

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-14 left-4 right-4 z-50 p-3.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{addedToast}</span>
          </div>
          <button onClick={() => setAddedToast(null)} className="text-slate-900 font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* Preset Selector Chips */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 mb-1.5 px-1">Quick Loan Presets</div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="h-8 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-850 active:scale-95 text-slate-300 font-medium whitespace-nowrap transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Result Banner Card */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium text-teal-400">Monthly EMI Payment</span>
          <button
            onClick={handleOpenAmortization}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors text-[11px]"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </button>
        </div>

        {/* Tabular EMI display */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {formatCurrency(emiResult.emi, settings.currencyCode)}
          </span>
          <span className="text-xs text-slate-400">/ month</span>
        </div>

        {/* Donut Chart & Breakdown */}
        <div className="grid grid-cols-12 gap-3 items-center pt-3 border-t border-slate-800">
          {/* SVG Donut */}
          <div className="col-span-4 flex items-center justify-center">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Principal segment (emerald) */}
                <path
                  className="text-emerald-500 transition-all duration-300"
                  strokeDasharray={`${principalPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400">Principal</span>
                <span className="text-xs font-bold font-mono text-emerald-400">
                  {principalPercent.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown numbers */}
          <div className="col-span-8 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                Principal Loan
              </span>
              <span className="font-mono font-semibold text-slate-200">
                {formatCurrency(principal, settings.currencyCode)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
                Total Interest
              </span>
              <span className="font-mono font-semibold text-teal-300">
                {formatCurrency(emiResult.totalInterest, settings.currencyCode)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
              <span className="text-slate-400 font-medium">Total Outflow</span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(emiResult.totalPayment, settings.currencyCode)}
              </span>
            </div>
          </div>
        </div>

        {/* 1-Tap Link to Expenses */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={handleSaveAndAddToExpenses}
            className="w-full h-11 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-[0.98] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add this EMI to Monthly Expenses</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls Card */}
      <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 space-y-4">
        {/* Loan Title & Category */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Loan Label</label>
            <input
              type="text"
              value={loanName}
              onChange={e => setLoanName(e.target.value)}
              placeholder="e.g. Car Loan"
              className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-400 mb-1 block">Category</label>
            <select
              value={loanCategory}
              onChange={e => setLoanCategory(e.target.value as LoanCategory)}
              className="w-full h-10 px-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="home">Home Loan</option>
              <option value="car">Car / Vehicle</option>
              <option value="personal">Personal</option>
              <option value="education">Education</option>
              <option value="gadget">Gadget / Other</option>
            </select>
          </div>
        </div>

        {/* Slider 1: Principal Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Loan Amount (Principal)</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-mono text-[11px]">{settings.currencyCode}</span>
              <input
                type="number"
                value={principal}
                onChange={e => setPrincipal(Math.max(1000, Number(e.target.value)))}
                className="w-28 h-8 px-2 rounded-md bg-slate-950 border border-slate-800 text-right font-mono font-bold text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <input
            type="range"
            min={isINR ? 25000 : 1000}
            max={isINR ? 10000000 : 500000}
            step={isINR ? 25000 : 1000}
            value={principal}
            onChange={e => setPrincipal(Number(e.target.value))}
            className="w-full"
          />

          {/* Quick Step Buttons */}
          <div className="flex items-center gap-1.5 justify-end text-[11px]">
            <button
              onClick={() => setPrincipal(prev => Math.max(1000, prev - stepAmount))}
              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            >
              -{formatCurrency(stepAmount, settings.currencyCode, true)}
            </button>
            <button
              onClick={() => setPrincipal(prev => prev + stepAmount)}
              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            >
              +{formatCurrency(stepAmount, settings.currencyCode, true)}
            </button>
          </div>
        </div>

        {/* Slider 2: Annual Interest Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Annual Interest Rate</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="30"
                value={annualRate}
                onChange={e => setAnnualRate(Number(e.target.value))}
                className="w-20 h-8 px-2 rounded-md bg-slate-950 border border-slate-800 text-right font-mono font-bold text-xs text-teal-300 focus:outline-none focus:border-teal-500"
              />
              <span className="text-slate-400 font-bold">%</span>
            </div>
          </div>

          <input
            type="range"
            min="3"
            max="25"
            step="0.1"
            value={annualRate}
            onChange={e => setAnnualRate(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>3% (Subsidized)</span>
            <span>8% - 10% (Typical)</span>
            <span>25% (High)</span>
          </div>
        </div>

        {/* Slider 3: Loan Tenure */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Loan Duration</span>
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => {
                  if (tenureUnit === 'months') {
                    setTenureUnit('years');
                    setTenureValue(Math.max(1, Math.round(tenureValue / 12)));
                  }
                }}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  tenureUnit === 'years' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Years
              </button>
              <button
                onClick={() => {
                  if (tenureUnit === 'years') {
                    setTenureUnit('months');
                    setTenureValue(tenureValue * 12);
                  }
                }}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  tenureUnit === 'months' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Months
              </button>
            </div>
          </div>

          <input
            type="range"
            min={tenureUnit === 'years' ? 1 : 6}
            max={tenureUnit === 'years' ? 30 : 360}
            step={1}
            value={tenureValue}
            onChange={e => setTenureValue(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              Tenure: <span className="text-white font-bold">{tenureValue} {tenureUnit}</span> ({tenureMonths} monthly payments)
            </span>
          </div>
        </div>
      </div>

      {/* Prepayment & Payoff Simulator Section */}
      <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 space-y-3">
        <button
          onClick={() => setShowPrepayment(!showPrepayment)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-200"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Prepayment & Early Payoff Simulator</span>
          </div>
          {showPrepayment ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showPrepayment && (
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Paying a small extra amount each month or an occasional lump-sum drastically cuts down total interest and pays off your loan years earlier!
            </p>

            {/* Extra Monthly Payment Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Extra Monthly Payment</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{formatCurrency(extraMonthly, settings.currencyCode)}/mo
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.round(emiResult.emi * 1.5)}
                step={isINR ? 500 : 25}
                value={extraMonthly}
                onChange={e => setExtraMonthly(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Lump-sum Payment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Lump-Sum Prepayment</span>
                <span className="font-mono font-bold text-teal-300">
                  {formatCurrency(lumpSumAmount, settings.currencyCode)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.round(principal * 0.5)}
                step={isINR ? 10000 : 500}
                value={lumpSumAmount}
                onChange={e => setLumpSumAmount(Number(e.target.value))}
                className="w-full"
              />
              {lumpSumAmount > 0 && (
                <div className="text-[11px] text-slate-400">
                  Paid at Month #{lumpSumMonth}
                </div>
              )}
            </div>

            {/* Simulator Outcome Card */}
            {(extraMonthly > 0 || lumpSumAmount > 0) && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  <span>Early Payoff Impact</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Interest Saved</span>
                    <span className="text-sm font-extrabold font-mono text-emerald-400">
                      {formatCurrency(amortizationSummary.interestSaved, settings.currencyCode)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Time Saved</span>
                    <span className="text-sm font-extrabold font-mono text-white">
                      {amortizationSummary.monthsSaved} months{' '}
                      <span className="text-[11px] text-slate-400">
                        ({(amortizationSummary.monthsSaved / 12).toFixed(1)} yrs)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saved / Active Loans Section */}
      <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">
            Active Loans ({loans.length})
          </span>
          {loans.length > 0 && (
            <span className="text-xs font-mono text-teal-300">
              Total EMI: {formatCurrency(loans.reduce((s, l) => s + l.emiAmount, 0), settings.currencyCode)}/mo
            </span>
          )}
        </div>

        {loans.length === 0 ? (
          <p className="text-xs text-slate-400 py-2 text-center leading-relaxed">
            No active loans saved yet. Calculate any loan above and tap &ldquo;Add this EMI to Monthly Expenses&rdquo; to track it here.
          </p>
        ) : (
          <div className="space-y-2">
            {loans.map(loan => (
              <div
                key={loan.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{loan.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {formatCurrency(loan.principal, settings.currencyCode, true)} · {loan.annualRate}% · {Math.round(loan.tenureMonths / 12)}y
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-teal-300">
                      {formatCurrency(loan.emiAmount, settings.currencyCode)}
                    </div>
                    <div className="text-[10px] text-slate-400">Monthly EMI</div>
                  </div>

                  <button
                    onClick={() => deleteLoan(loan.id)}
                    className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Loan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
