import { useState, useEffect, useCallback } from 'react';
import type { SavingsGoal } from '@/types';
import { capacitorStorage } from '@/utils/capacitorStorage';

export function useSavings() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    capacitorStorage.getSavingsGoals().then(data => {
      setGoals(data);
      setIsLoading(false);
    });
  }, []);

  const persist = useCallback(async (updated: SavingsGoal[]) => {
    setGoals(updated);
    await capacitorStorage.saveSavingsGoals(updated);
  }, []);

  const addGoal = useCallback(
    async (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => {
      const newGoal: SavingsGoal = {
        ...goal,
        id: crypto.randomUUID(),
        currentAmount: 0,
        createdAt: new Date().toISOString(),
      };
      await persist([...goals, newGoal]);
      return newGoal;
    },
    [goals, persist],
  );

  const updateGoal = useCallback(
    async (id: string, updates: Partial<SavingsGoal>) => {
      await persist(goals.map(g => (g.id === id ? { ...g, ...updates } : g)));
    },
    [goals, persist],
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      await persist(goals.filter(g => g.id !== id));
    },
    [goals, persist],
  );

  const contributeToGoal = useCallback(
    async (id: string, amount: number) => {
      await persist(
        goals.map(g =>
          g.id === id
            ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) }
            : g,
        ),
      );
    },
    [goals, persist],
  );

  const getTotalSaved = useCallback(
    () => goals.reduce((sum, g) => sum + g.currentAmount, 0),
    [goals],
  );

  const getTotalTarget = useCallback(
    () => goals.reduce((sum, g) => sum + g.targetAmount, 0),
    [goals],
  );

  return {
    goals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    getTotalSaved,
    getTotalTarget,
  };
}
