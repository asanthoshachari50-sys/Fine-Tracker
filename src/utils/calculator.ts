import { AmortizationRow, AmortizationSummary, CurrencyConfig, ExpenseCategory } from '../types';

export const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar ($)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (€)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (£)', locale: 'en-GB' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)', locale: 'en-CA' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)', locale: 'en-AU' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)', locale: 'en-SG' },
};

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: 'housing', name: 'Housing & Rent', icon: 'Home', color: 'text-amber-400', bgColor: 'bg-amber-400/10', type: 'need' },
  { id: 'groceries', name: 'Groceries & Food', icon: 'ShoppingBag', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', type: 'need' },
  { id: 'transport', name: 'Transport & Fuel', icon: 'Car', color: 'text-blue-400', bgColor: 'bg-blue-400/10', type: 'need' },
  { id: 'utilities', name: 'Bills & Utilities', icon: 'Zap', color: 'text-cyan-400', bgColor: 'bg-cyan-400/10', type: 'need' },
  { id: 'dining', name: 'Dining & Cafes', icon: 'Utensils', color: 'text-orange-400', bgColor: 'bg-orange-400/10', type: 'want' },
  { id: 'health', name: 'Health & Medical', icon: 'Activity', color: 'text-rose-400', bgColor: 'bg-rose-400/10', type: 'need' },
  { id: 'shopping', name: 'Shopping & Clothes', icon: 'Package', color: 'text-purple-400', bgColor: 'bg-purple-400/10', type: 'want' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: 'text-pink-400', bgColor: 'bg-pink-400/10', type: 'want' },
  { id: 'emi_debt', name: 'EMI & Loans', icon: 'Landmark', color: 'text-teal-400', bgColor: 'bg-teal-400/10', type: 'obligation' },
  { id: 'other', name: 'General & Others', icon: 'MoreHorizontal', color: 'text-slate-400', bgColor: 'bg-slate-400/10', type: 'want' },
];

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): {
  emi: number;
  totalInterest: number;
  totalPayment: number;
} {
  if (principal <= 0 || tenureMonths <= 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0 };
  }

  if (annualRate <= 0) {
    const emi = Math.round(principal / tenureMonths);
    return {
      emi,
      totalInterest: 0,
      totalPayment: principal,
    };
  }

  const monthlyRate = annualRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
  };
}

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  startDateStr: string,
  extraMonthlyPayment: number = 0,
  lumpSumAmount: number = 0,
  lumpSumMonth: number = 1
): AmortizationSummary {
  const { emi: standardEmi, totalInterest: totalInterestStandard } = calculateEMI(principal, annualRate, tenureMonths);

  if (principal <= 0 || tenureMonths <= 0) {
    return {
      standardEmi: 0,
      totalInterestStandard: 0,
      totalMonthsStandard: 0,
      totalInterestWithPrepayment: 0,
      totalMonthsWithPrepayment: 0,
      interestSaved: 0,
      monthsSaved: 0,
      schedule: [],
    };
  }

  const monthlyRate = annualRate / 12 / 100;
  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let cumulativeInterest = 0;
  const start = new Date(startDateStr || new Date().toISOString().split('T')[0]);

  let month = 1;
  const maxSafetyMonths = tenureMonths + 24;

  while (balance > 0.01 && month <= maxSafetyMonths) {
    const beginningBalance = balance;
    const interest = monthlyRate > 0 ? balance * monthlyRate : 0;
    
    // Check if extra prepayment applies
    let prepayment = extraMonthlyPayment;
    if (lumpSumAmount > 0 && month === lumpSumMonth) {
      prepayment += lumpSumAmount;
    }

    // Standard principal from standard EMI
    let basePrincipal = standardEmi - interest;
    if (basePrincipal < 0) basePrincipal = 0;

    let totalPrincipalPaid = basePrincipal + prepayment;
    
    if (totalPrincipalPaid >= balance) {
      totalPrincipalPaid = balance;
      balance = 0;
    } else {
      balance -= totalPrincipalPaid;
    }

    cumulativeInterest += interest;

    const currentDate = new Date(start);
    currentDate.setMonth(start.getMonth() + (month - 1));

    const dateFormatted = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const yearNumber = Math.ceil(month / 12);
    const monthInYear = ((month - 1) % 12) + 1;

    schedule.push({
      monthIndex: month,
      yearNumber,
      monthInYear,
      dateFormatted,
      beginningBalance: Math.round(beginningBalance),
      emi: Math.round(interest + totalPrincipalPaid),
      principalPaid: Math.round(totalPrincipalPaid),
      interestPaid: Math.round(interest),
      endingBalance: Math.round(balance),
      cumulativeInterest: Math.round(cumulativeInterest),
      prepaymentAmount: prepayment > 0 ? Math.round(prepayment) : undefined,
    });

    if (balance <= 0.01) break;
    month++;
  }

  const totalMonthsWithPrepayment = schedule.length;
  const totalInterestWithPrepayment = Math.round(cumulativeInterest);
  const interestSaved = Math.max(0, totalInterestStandard - totalInterestWithPrepayment);
  const monthsSaved = Math.max(0, tenureMonths - totalMonthsWithPrepayment);

  return {
    standardEmi,
    totalInterestStandard,
    totalMonthsStandard: tenureMonths,
    totalInterestWithPrepayment,
    totalMonthsWithPrepayment,
    interestSaved,
    monthsSaved,
    schedule,
  };
}

export function formatCurrency(amount: number, currencyCode: string = 'INR', compact: boolean = false): string {
  const cfg = CURRENCIES[currencyCode] || CURRENCIES.INR;
  
  if (compact && Math.abs(amount) >= 100000) {
    if (currencyCode === 'INR') {
      if (Math.abs(amount) >= 10000000) {
        return `${cfg.symbol}${(amount / 10000000).toFixed(2)} Cr`;
      }
      return `${cfg.symbol}${(amount / 100000).toFixed(2)} L`;
    } else {
      if (Math.abs(amount) >= 1000000) {
        return `${cfg.symbol}${(amount / 1000000).toFixed(1)}M`;
      }
      return `${cfg.symbol}${(amount / 1000).toFixed(1)}k`;
    }
  }

  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.code,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${cfg.symbol}${amount.toLocaleString()}`;
  }
}

export function getCurrentMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function formatMonthName(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
