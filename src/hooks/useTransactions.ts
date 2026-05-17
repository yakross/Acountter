import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '@/types';
import { capacitorStorage } from '@/utils/capacitorStorage';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    capacitorStorage.getTransactions().then(data => {
      setTransactions(data);
      setIsLoading(false);
    });
  }, []);

  const persist = useCallback(async (updated: Transaction[]) => {
    setTransactions(updated);
    await capacitorStorage.saveTransactions(updated);
  }, []);

  const addTransaction = useCallback(
    async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
      const newTx: Transaction = {
        ...tx,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      await persist([...transactions, newTx]);
      return newTx;
    },
    [transactions, persist],
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
      const updated = transactions.map(t => (t.id === id ? { ...t, ...updates } : t));
      await persist(updated);
    },
    [transactions, persist],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      await persist(transactions.filter(t => t.id !== id));
    },
    [transactions, persist],
  );

  const getBalance = useCallback(
    () =>
      transactions.reduce(
        (acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount),
        0,
      ),
    [transactions],
  );

  const getMonthlyTotals = useCallback(
    (month: string) => {
      const monthTx = transactions.filter(t => t.date.startsWith(month));
      return {
        income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    },
    [transactions],
  );

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getBalance,
    getMonthlyTotals,
  };
}
