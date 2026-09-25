import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileFrame } from './components/MobileFrame';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { EmiCalculatorView } from './components/EmiCalculatorView';
import { InsightsView } from './components/InsightsView';
import { AddExpenseSheet } from './components/AddExpenseSheet';
import { AmortizationModal } from './components/AmortizationModal';
import { SettingsModal } from './components/SettingsModal';

const MainContent: React.FC = () => {
  const { currentTab } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <TopBar onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="flex-1">
        {currentTab === 'overview' && (
          <DashboardView onOpenBudget={() => setIsSettingsOpen(true)} />
        )}
        {currentTab === 'expenses' && <ExpensesView />}
        {currentTab === 'emi' && <EmiCalculatorView />}
        {currentTab === 'insights' && <InsightsView />}
      </main>

      <BottomNav />

      {/* Slide-up Modals & Drawers */}
      <AddExpenseSheet />
      <AmortizationModal />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MobileFrame>
        <MainContent />
      </MobileFrame>
    </AppProvider>
  );
}
