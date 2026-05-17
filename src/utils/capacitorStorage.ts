/**
 * capacitorStorage.ts — única capa de persistencia de la app.
 *
 * En Android usa @capacitor/preferences (nativo).
 * En web usa el polyfill de Capacitor sobre localStorage.
 * Ya NO importamos localStorage directamente en ningún hook.
 */
import { Preferences } from '@capacitor/preferences';
import type { Transaction, SavingsGoal, RecurringPayment, Budget } from '@/types';

const KEYS = {
  transactions: 'finance_transactions',
  savings: 'finance_savings',
  recurring: 'finance_recurring',
  budgets: 'finance_budgets',
  settings: 'finance_settings',
  security: 'finance_security',
  currency: 'finance_currency',
};

// ── Base helpers ─────────────────────────────────────────────────────────────

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const { value } = await Preferences.get({ key });
    return value ? (JSON.parse(value) as T) : null;
  } catch (err) {
    console.error(`[storage] read error for "${key}":`, err);
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await Preferences.set({ key, value: JSON.stringify(value) });
  } catch (err) {
    console.error(`[storage] write error for "${key}":`, err);
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch (err) {
    console.error(`[storage] remove error for "${key}":`, err);
  }
}

async function getList<T>(key: string): Promise<T[]> {
  return (await getItem<T[]>(key)) ?? [];
}

// ── Public API ───────────────────────────────────────────────────────────────

export const capacitorStorage = {
  // Raw access (used by useSecurity)
  getItem,
  setItem,
  removeItem,

  // Transactions
  getTransactions: () => getList<Transaction>(KEYS.transactions),
  saveTransactions: (data: Transaction[]) => setItem(KEYS.transactions, data),

  // Savings goals
  getSavingsGoals: () => getList<SavingsGoal>(KEYS.savings),
  saveSavingsGoals: (data: SavingsGoal[]) => setItem(KEYS.savings, data),

  // Recurring payments
  getRecurringPayments: () => getList<RecurringPayment>(KEYS.recurring),
  saveRecurringPayments: (data: RecurringPayment[]) => setItem(KEYS.recurring, data),

  // Budgets
  getBudgets: () => getList<Budget>(KEYS.budgets),
  saveBudgets: (data: Budget[]) => setItem(KEYS.budgets, data),

  // Currency preference
  getCurrency: async (): Promise<string> =>
    (await getItem<string>(KEYS.currency)) ?? 'COP',
  saveCurrency: (code: string) => setItem(KEYS.currency, code),

  // Backup / Restore
  exportAll: async (): Promise<string> => {
    const payload = {
      version: 2,
      exportDate: new Date().toISOString(),
      transactions: await getList<Transaction>(KEYS.transactions),
      savings: await getList<SavingsGoal>(KEYS.savings),
      recurring: await getList<RecurringPayment>(KEYS.recurring),
      budgets: await getList<Budget>(KEYS.budgets),
    };
    return JSON.stringify(payload, null, 2);
  },

  importAll: async (json: string): Promise<void> => {
    const data = JSON.parse(json);
    if (data.transactions) await setItem(KEYS.transactions, data.transactions);
    if (data.savings) await setItem(KEYS.savings, data.savings);
    if (data.recurring) await setItem(KEYS.recurring, data.recurring);
    if (data.budgets) await setItem(KEYS.budgets, data.budgets);
  },
};
