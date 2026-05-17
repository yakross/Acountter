export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  date: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'tip' | 'achievement' | 'suggestion';
  title: string;
  message: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface CategoryStats {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export type ViewType = 'dashboard' | 'transactions' | 'savings' | 'analytics' | 'recurring' | 'budgets' | 'organizer' | 'security';

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  percentage: number;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly';
  alertThreshold: number;
  createdAt: string;
}

export interface BudgetAllocation {
  needs: number;
  wants: number;
  savings: number;
  custom: { name: string; percentage: number }[];
}
