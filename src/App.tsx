import { useState, useEffect, Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Sidebar } from '@/components/Sidebar';
import { useTransactions } from '@/hooks/useTransactions';
import { useSavings } from '@/hooks/useSavings';
import { useAI } from '@/hooks/useAI';
import { useRecurring } from '@/hooks/useRecurring';
import { useBudgets } from '@/hooks/useBudgets';
import { useSecurity } from '@/hooks/useSecurity';
import { useExpenseOrganizer } from '@/hooks/useExpenseOrganizer';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import type { ViewType } from '@/types';

// Code-split views
const Dashboard        = lazy(() => import('@/components/Dashboard').then(m => ({ default: m.Dashboard })));
const TransactionForm  = lazy(() => import('@/components/TransactionForm').then(m => ({ default: m.TransactionForm })));
const TransactionList  = lazy(() => import('@/components/TransactionList').then(m => ({ default: m.TransactionList })));
const SavingsGoals     = lazy(() => import('@/components/SavingsGoals').then(m => ({ default: m.SavingsGoals })));
const AIInsights       = lazy(() => import('@/components/AIInsights').then(m => ({ default: m.AIInsights })));
const RecurringPayments = lazy(() => import('@/components/RecurringPayments').then(m => ({ default: m.RecurringPayments })));
const BudgetManager    = lazy(() => import('@/components/BudgetManager').then(m => ({ default: m.BudgetManager })));
const ExpenseOrganizer = lazy(() => import('@/components/ExpenseOrganizer').then(m => ({ default: m.ExpenseOrganizer })));
const SecuritySettingsPanel = lazy(() => import('@/components/Security').then(m => ({ default: m.SecuritySettingsPanel })));
const PinLock          = lazy(() => import('@/components/Security').then(m => ({ default: m.PinLock })));
const Onboarding       = lazy(() => import('@/components/Onboarding').then(m => ({ default: m.Onboarding })));

const Spinner = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
  </div>
);

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { goals, addGoal, deleteGoal, contributeToGoal } = useSavings();
  const { insights } = useAI(transactions, goals);
  const {
    payments, addPayment, deletePayment, toggleActive, processRecurringPayments,
  } = useRecurring();
  const {
    budgets, monthlyIncome, deleteBudget, updateSpending,
    apply503020Rule, createCustomAllocation, getBudgetStatus,
  } = useBudgets(transactions);
  const {
    settings: securitySettings, isLocked, isLoading: securityLoading,
    setupPin, verifyPin, disableSecurity, updateAutoLockTimeout,
  } = useSecurity();
  const {
    templates, settings: organizerSettings, stats: organizerStats,
    applyTemplate, updateCategoryAllocation, addCustomCategory, removeCategory,
  } = useExpenseOrganizer(transactions);

  // Keep budget spending in sync
  useEffect(() => { updateSpending(); }, [transactions, updateSpending]);

  // ── Auto-process recurring payments once on load ─────────────────────────
  useEffect(() => {
    if (payments.length === 0) return;

    processRecurringPayments().then(generated => {
      generated.forEach(tx => addTransaction(tx));
    });
    // Run once per day: store last-processed date in session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments.length]); // re-runs only if the number of payments changes

  // Load dark mode and onboarding preferences
  useEffect(() => {
    const initApp = async () => {
      const isDark = localStorage.getItem('darkMode') === 'true';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const hasOnboarded = localStorage.getItem('hasOnboarded') === 'true';
      if (!hasOnboarded) {
        setShowOnboarding(true);
      }
    };
    initApp();
  }, []);

  if (securityLoading) return <Spinner />;

  if (isLocked && securitySettings.enabled) {
    return (
      <Suspense fallback={<Spinner />}>
        <PinLock mode="unlock" onUnlock={verifyPin} title="Ingresa tu PIN" />
      </Suspense>
    );
  }

  if (showOnboarding) {
    return (
      <Suspense fallback={<Spinner />}>
        <Onboarding onComplete={() => {
          localStorage.setItem('hasOnboarded', 'true');
          setShowOnboarding(false);
        }} />
      </Suspense>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <Dashboard />
            <AIInsights insights={insights.slice(0, 3)} />
          </div>
        );

      case 'transactions':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TransactionForm onSubmit={addTransaction} />
            </div>
            <div className="lg:col-span-2">
              <TransactionList
                transactions={transactions}
                onDelete={deleteTransaction}
                onUpdate={updateTransaction}
              />
            </div>
          </div>
        );

      case 'recurring':
        return (
          <RecurringPayments
            payments={payments}
            onAddPayment={addPayment}
            onDeletePayment={deletePayment}
            onToggleActive={toggleActive}
          />
        );

      case 'budgets':
        return (
          <BudgetManager
            budgets={budgets}
            monthlyIncome={monthlyIncome}
            onDeleteBudget={deleteBudget}
            onApply503020={apply503020Rule}
            onCreateCustom={createCustomAllocation}
            getBudgetStatus={getBudgetStatus}
          />
        );

      case 'savings':
        return (
          <SavingsGoals
            goals={goals}
            onAddGoal={addGoal}
            onDeleteGoal={deleteGoal}
            onContribute={contributeToGoal}
          />
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Análisis Financiero</h2>
            <AIInsights insights={insights} />
          </div>
        );

      case 'organizer':
        return (
          <ExpenseOrganizer
            templates={templates}
            currentCategories={organizerSettings.categories}
            totalBudget={organizerSettings.totalBudget}
            onApplyTemplate={applyTemplate}
            onUpdateAllocation={updateCategoryAllocation}
            onAddCategory={addCustomCategory}
            onRemoveCategory={removeCategory}
            stats={organizerStats}
          />
        );

      case 'security':
        return (
          <SecuritySettingsPanel
            settings={securitySettings}
            onSetupPin={setupPin}
            onVerifyPin={verifyPin}
            onDisableSecurity={disableSecurity}
            onUpdateTimeout={updateAutoLockTimeout}
          />
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />

      <main className="flex-1 p-4 pt-16 lg:p-8 overflow-auto">
        <ErrorBoundary fallbackRender={({ error }) => (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            <h2 className="font-bold mb-2">Ha ocurrido un error en la aplicación:</h2>
            <pre className="text-sm whitespace-pre-wrap">{error instanceof Error ? error.message : String(error)}</pre>
          </div>
        )}>
          <Suspense fallback={<Spinner />}>
            {renderContent()}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <CurrencyProvider>
      <AppContent />
    </CurrencyProvider>
  );
}

export default App;
