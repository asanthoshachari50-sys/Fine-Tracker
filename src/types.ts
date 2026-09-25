export type PaymentMode = 'upi' | 'card' | 'cash' | 'bank';

export type CategoryType = 'need' | 'want' | 'obligation' | 'investment';

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  type: CategoryType;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMode: PaymentMode;
  notes?: string;
  isRecurringEmi?: boolean;
  emiLoanId?: string;
  createdAt: number;
}

export type LoanCategory = 'home' | 'car' | 'personal' | 'education' | 'gold' | 'business' | 'gadget' | 'other';

export interface Loan {
  id: string;
  name: string;
  category: LoanCategory;
  principal: number;
  annualRate: number;
  tenureMonths: number;
  emiAmount: number;
  totalInterest: number;
  totalPayment: number;
  startDate: string; // YYYY-MM-DD
  isLinkedToExpenses?: boolean;
  notes?: string;
}

export interface AmortizationRow {
  monthIndex: number;
  yearNumber: number;
  monthInYear: number;
  dateFormatted: string;
  beginningBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  cumulativeInterest: number;
  prepaymentAmount?: number;
}

export interface AmortizationSummary {
  standardEmi: number;
  totalInterestStandard: number;
  totalMonthsStandard: number;
  totalInterestWithPrepayment: number;
  totalMonthsWithPrepayment: number;
  interestSaved: number;
  monthsSaved: number;
  schedule: AmortizationRow[];
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export interface AppSettings {
  currencyCode: string;
  monthlyIncome: number;
  monthlyBudget: number;
  showMobileShell: boolean;
}

export type TabType = 'overview' | 'expenses' | 'emi' | 'insights';
