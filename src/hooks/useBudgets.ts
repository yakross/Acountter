import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Budget, BudgetAllocation, Transaction } from '@/types';
import { capacitorStorage } from '@/utils/capacitorStorage';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

// Default 50/30/20 rule
const DEFAULT_ALLOCATION: BudgetAllocation = {
  needs: 50,
  wants: 30,
  savings: 20,
  custom: [],
};

export function useBudgets(transactions: Transaction[]) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [allocation, setAllocation] = useState<BudgetAllocation>(DEFAULT_ALLOCATION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    const data = await capacitorStorage.getBudgets();
    setBudgets(data);
    setIsLoading(false);
  };

  // Calculate monthly income
  const monthlyIncome = useMemo(() => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    return transactions
      .filter(t => {
        const date = parseISO(t.date);
        return t.type === 'income' && isWithinInterval(date, { start: monthStart, end: monthEnd });
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Calculate amounts based on percentages
  const calculatedBudgets = useMemo(() => {
    return budgets.map(budget => ({
      ...budget,
      amount: monthlyIncome * (budget.percentage / 100),
    }));
  }, [budgets, monthlyIncome]);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id' | 'createdAt' | 'spent'>) => {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      spent: 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [...budgets, newBudget];
    setBudgets(updated);
    await capacitorStorage.saveBudgets(updated);
    return newBudget;
  }, [budgets]);

  const updateBudget = useCallback(async (id: string, updates: Partial<Budget>) => {
    const updated = budgets.map(b => 
      b.id === id ? { ...b, ...updates } : b
    );
    setBudgets(updated);
    await capacitorStorage.saveBudgets(updated);
  }, [budgets]);

  const deleteBudget = useCallback(async (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    await capacitorStorage.saveBudgets(updated);
  }, [budgets]);

  const updateSpending = useCallback(async () => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const updatedBudgets = budgets.map(budget => {
      const spent = transactions
        .filter(t => {
          const date = parseISO(t.date);
          return t.type === 'expense' && 
            t.category === budget.category &&
            isWithinInterval(date, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return { ...budget, spent };
    });

    setBudgets(updatedBudgets);
    await capacitorStorage.saveBudgets(updatedBudgets);
  }, [budgets, transactions]);

  // Apply 50/30/20 rule automatically
  const apply503020Rule = useCallback(async (income: number) => {
    const defaultBudgets = [
      { name: 'Necesidades', category: 'needs', percentage: 50, amount: income * 0.5, period: 'monthly' as const, alertThreshold: 80 },
      { name: 'Deseos', category: 'wants', percentage: 30, amount: income * 0.3, period: 'monthly' as const, alertThreshold: 80 },
      { name: 'Ahorros', category: 'savings', percentage: 20, amount: income * 0.2, period: 'monthly' as const, alertThreshold: 90 },
    ];

    const newBudgets: Budget[] = defaultBudgets.map(b => ({
      ...b,
      id: crypto.randomUUID(),
      spent: 0,
      amount: income * (b.percentage / 100),
      createdAt: new Date().toISOString(),
    }));

    setBudgets(newBudgets);
    await capacitorStorage.saveBudgets(newBudgets);
    setAllocation(DEFAULT_ALLOCATION);
  }, []);

  // Create custom allocation
  const createCustomAllocation = useCallback(async (
    _budgetName: string,
    percentages: { name: string; percentage: number }[],
    income: number
  ) => {
    const totalPercentage = percentages.reduce((sum, p) => sum + p.percentage, 0);
    if (totalPercentage !== 100) {
      throw new Error('Las porcentajes deben sumar 100%');
    }

    const customBudgets: Budget[] = percentages.map(p => ({
      id: crypto.randomUUID(),
      name: p.name,
      category: p.name.toLowerCase(),
      percentage: p.percentage,
      amount: income * (p.percentage / 100),
      spent: 0,
      period: 'monthly',
      alertThreshold: 80,
      createdAt: new Date().toISOString(),
    }));

    setBudgets(customBudgets);
    await capacitorStorage.saveBudgets(customBudgets);
    setAllocation({
      needs: 0,
      wants: 0,
      savings: 0,
      custom: percentages,
    });
  }, []);

  const getBudgetStatus = useCallback((budget: Budget) => {
    const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - budget.spent;
    
    return {
      percentage,
      remaining,
      isOverBudget: percentage > 100,
      isNearLimit: percentage >= budget.alertThreshold,
      status: percentage > 100 ? 'exceeded' : percentage >= budget.alertThreshold ? 'warning' : 'good',
    };
  }, []);

  const getTotalBudgeted = useMemo(() => {
    return calculatedBudgets.reduce((sum, b) => sum + b.amount, 0);
  }, [calculatedBudgets]);

  const getTotalSpent = useMemo(() => {
    return budgets.reduce((sum, b) => sum + b.spent, 0);
  }, [budgets]);

  return {
    budgets: calculatedBudgets,
    allocation,
    isLoading,
    monthlyIncome,
    addBudget,
    updateBudget,
    deleteBudget,
    updateSpending,
    apply503020Rule,
    createCustomAllocation,
    getBudgetStatus,
    getTotalBudgeted,
    getTotalSpent,
  };
}
