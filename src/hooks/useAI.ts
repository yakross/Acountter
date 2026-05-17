import { useMemo } from 'react';
import type { Transaction, SavingsGoal } from '@/types';
import { aiService } from '@/services/aiService';

export function useAI(transactions: Transaction[], goals: SavingsGoal[]) {
  const insights = useMemo(() => {
    const spendingInsights = aiService.analyzeSpending(transactions);
    const savingsInsights = aiService.generateSavingsPlan(transactions, goals);
    return [...spendingInsights, ...savingsInsights].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [transactions, goals]);

  const monthlyStats = useMemo(() => {
    return aiService.getMonthlyStats(transactions, 6);
  }, [transactions]);

  const expenseStats = useMemo(() => {
    return aiService.getCategoryStats(transactions, 'expense', 3);
  }, [transactions]);

  const incomeStats = useMemo(() => {
    return aiService.getCategoryStats(transactions, 'income', 3);
  }, [transactions]);

  return {
    insights,
    monthlyStats,
    expenseStats,
    incomeStats,
  };
}
