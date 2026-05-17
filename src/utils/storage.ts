import type { Transaction, SavingsGoal } from '@/types';

const STORAGE_KEYS = {
  transactions: 'finance_transactions',
  savings: 'finance_savings',
  settings: 'finance_settings',
};

export const storage = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.transactions);
    return data ? JSON.parse(data) : [];
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  },

  getSavingsGoals: (): SavingsGoal[] => {
    const data = localStorage.getItem(STORAGE_KEYS.savings);
    return data ? JSON.parse(data) : [];
  },

  saveSavingsGoals: (goals: SavingsGoal[]) => {
    localStorage.setItem(STORAGE_KEYS.savings, JSON.stringify(goals));
  },

  exportData: () => {
    const data = {
      transactions: storage.getTransactions(),
      savings: storage.getSavingsGoals(),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData: (file: File): Promise<{ transactions: Transaction[]; savings: SavingsGoal[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.transactions) storage.saveTransactions(data.transactions);
          if (data.savings) storage.saveSavingsGoals(data.savings);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },
};
