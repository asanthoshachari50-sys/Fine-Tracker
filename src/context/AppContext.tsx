import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings, Expense, Loan, TabType } from '../types';
import { getCurrentMonthKey } from '../utils/calculator';

interface AppContextType {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updated: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  clearAllExpenses: () => void;
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id'>) => Loan;
  updateLoan: (id: string, updated: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  linkLoanToExpenses: (loanId: string) => void;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (open: boolean) => void;
  isAmortizationOpen: boolean;
  setIsAmortizationOpen: (open: boolean) => void;
  activeAmortizationLoan: Loan | null;
  setActiveAmortizationLoan: (loan: Loan | null) => void;
  clearAllData: () => void;
}

const STORAGE_KEY_EXPENSES = 'finpulse_expenses_pure_v3';
const STORAGE_KEY_LOANS = 'finpulse_loans_pure_v3';
const STORAGE_KEY_SETTINGS = 'finpulse_settings_pure_v3';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthKey());
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAmortizationOpen, setIsAmortizationOpen] = useState(false);
  const [activeAmortizationLoan, setActiveAmortizationLoan] = useState<Loan | null>(null);

  // Clear out ALL legacy test keys immediately
  useEffect(() => {
    try {
      localStorage.removeItem('finpulse_expenses_v1');
      localStorage.removeItem('finpulse_loans_v1');
      localStorage.removeItem('finpulse_settings_v1');
      localStorage.removeItem('finpulse_expenses_clean_v2');
      localStorage.removeItem('finpulse_loans_clean_v2');
      localStorage.removeItem('finpulse_settings_clean_v2');
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Clean initial settings - no sample data
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      currencyCode: 'INR',
      monthlyIncome: 0,
      monthlyBudget: 0,
      showMobileShell: true,
    };
  });

  // Fresh expenses - pure empty array by default (0 expenses)
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXPENSES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Fresh loans - pure empty array by default (0 loans)
  const [loans, setLoans] = useState<Loan[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOANS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error(e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(loans));
    } catch (e) {
      console.error(e);
    }
  }, [loans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  const addExpense = (newExp: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const expense: Expense = {
      ...newExp,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setExpenses(prev => [expense, ...prev]);
    return expense;
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(item => item.id !== id));
  };

  const clearAllExpenses = () => {
    setExpenses([]);
  };

  const addLoan = (newLoan: Omit<Loan, 'id'>): Loan => {
    const loan: Loan = {
      ...newLoan,
      id: `loan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setLoans(prev => [loan, ...prev]);
    return loan;
  };

  const updateLoan = (id: string, updated: Partial<Loan>) => {
    setLoans(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
  };

  const deleteLoan = (id: string) => {
    setLoans(prev => prev.filter(item => item.id !== id));
    setExpenses(prev => prev.filter(exp => exp.emiLoanId !== id));
  };

  const linkLoanToExpenses = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const currentMonth = getCurrentMonthKey();
    const existing = expenses.find(
      e => e.emiLoanId === loanId && e.date.startsWith(currentMonth)
    );

    if (existing) {
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newExpense: Expense = {
      id: `exp_emi_${loanId}_${Date.now()}`,
      title: `${loan.name} (EMI)`,
      amount: loan.emiAmount,
      category: 'emi_debt',
      date: todayStr,
      paymentMode: 'bank',
      isRecurringEmi: true,
      emiLoanId: loan.id,
      notes: `Monthly EMI repayment for ${loan.name}`,
      createdAt: Date.now(),
    };

    setExpenses(prev => [newExpense, ...prev]);
    updateLoan(loanId, { isLinkedToExpenses: true });
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const clearAllData = () => {
    setExpenses([]);
    setLoans([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        clearAllExpenses,
        loans,
        addLoan,
        updateLoan,
        deleteLoan,
        linkLoanToExpenses,
        settings,
        updateSettings,
        selectedMonth,
        setSelectedMonth,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        isAmortizationOpen,
        setIsAmortizationOpen,
        activeAmortizationLoan,
        setActiveAmortizationLoan,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
