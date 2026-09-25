import React, { useState, useMemo } from 'react';
import { X, Download, Calendar, Landmark, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateAmortizationSchedule, formatCurrency } from '../utils/calculator';

export const AmortizationModal: React.FC = () => {
  const { isAmortizationOpen, setIsAmortizationOpen, activeAmortizationLoan, settings } = useApp();
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');

  if (!isAmortizationOpen || !activeAmortizationLoan) return null;

  const loan = activeAmortizationLoan;
  const scheduleData = generateAmortizationSchedule(
    loan.principal,
    loan.annualRate,
    loan.tenureMonths,
    loan.startDate || new Date().toISOString().split('T')[0]
  );

  // Group by year for yearly view
  const yearlySummary = useMemo(() => {
    const years: {
      [year: number]: {
        year: number;
        principalPaid: number;
        interestPaid: number;
        endingBalance: number;
        monthsCount: number;
      };
    } = {};

    scheduleData.schedule.forEach(row => {
      if (!years[row.yearNumber]) {
        years[row.yearNumber] = {
          year: row.yearNumber,
          principalPaid: 0,
          interestPaid: 0,
          endingBalance: row.endingBalance,
          monthsCount: 0,
        };
      }
      years[row.yearNumber].principalPaid += row.principalPaid;
      years[row.yearNumber].interestPaid += row.interestPaid;
      years[row.yearNumber].endingBalance = row.endingBalance;
      years[row.yearNumber].monthsCount += 1;
    });

    return Object.values(years);
  }, [scheduleData]);

  const exportScheduleCSV = () => {
    const headers = ['Month', 'Date', 'Beginning Balance', 'EMI', 'Principal Paid', 'Interest Paid', 'Ending Balance'];
    const rows = scheduleData.schedule.map(r => [
      r.monthIndex,
      r.dateFormatted,
      r.beginningBalance,
      r.emi,
      r.principalPaid,
      r.interestPaid,
      r.endingBalance,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${loan.name}_Amortization_Schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-[11px] text-teal-400 font-medium">Repayment Schedule</span>
            <h2 className="text-base font-bold text-white truncate max-w-[260px]">{loan.name}</h2>
          </div>
          <button
            onClick={() => setIsAmortizationOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loan Key Figures */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 grid grid-cols-3 gap-2 text-center flex-shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 block">Monthly EMI</span>
            <span className="text-xs font-bold font-mono text-teal-300">
              {formatCurrency(loan.emiAmount, settings.currencyCode)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Total Interest</span>
            <span className="text-xs font-bold font-mono text-white">
              {formatCurrency(loan.totalInterest, settings.currencyCode)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Total Repayment</span>
            <span className="text-xs font-bold font-mono text-emerald-400">
              {formatCurrency(loan.totalPayment, settings.currencyCode)}
            </span>
          </div>
        </div>

        {/* View Mode Toggle & CSV Export */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'yearly' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              Yearly Summary
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'monthly' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              Monthly Breakdown
            </button>
          </div>

          <button
            onClick={exportScheduleCSV}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'yearly' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-4 text-[10px] font-semibold text-slate-400 px-2 pb-1 border-b border-slate-800">
                <span>Period</span>
                <span className="text-right">Principal</span>
                <span className="text-right">Interest</span>
                <span className="text-right">Balance</span>
              </div>

              {yearlySummary.map(row => (
                <div
                  key={row.year}
                  className="grid grid-cols-4 text-xs font-mono py-2.5 px-2 rounded-lg bg-slate-950/60 border border-slate-800/60 items-center"
                >
                  <span className="font-sans font-semibold text-slate-200">Year {row.year}</span>
                  <span className="text-right text-emerald-400">
                    {formatCurrency(row.principalPaid, settings.currencyCode, true)}
                  </span>
                  <span className="text-right text-teal-300">
                    {formatCurrency(row.interestPaid, settings.currencyCode, true)}
                  </span>
                  <span className="text-right text-slate-300 font-bold">
                    {formatCurrency(row.endingBalance, settings.currencyCode, true)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-4 text-[10px] font-semibold text-slate-400 px-2 pb-1 border-b border-slate-800">
                <span>Month</span>
                <span className="text-right">Principal</span>
                <span className="text-right">Interest</span>
                <span className="text-right">Balance</span>
              </div>

              {scheduleData.schedule.map(row => (
                <div
                  key={row.monthIndex}
                  className="grid grid-cols-4 text-[11px] font-mono py-2 px-2 rounded-lg bg-slate-950/50 border border-slate-800/40 items-center hover:bg-slate-800/40"
                >
                  <div>
                    <span className="text-white font-medium block">M{row.monthIndex}</span>
                    <span className="text-[10px] text-slate-500 font-sans">{row.dateFormatted}</span>
                  </div>
                  <span className="text-right text-emerald-400">
                    {formatCurrency(row.principalPaid, settings.currencyCode)}
                  </span>
                  <span className="text-right text-teal-300">
                    {formatCurrency(row.interestPaid, settings.currencyCode)}
                  </span>
                  <span className="text-right text-slate-300">
                    {formatCurrency(row.endingBalance, settings.currencyCode)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
