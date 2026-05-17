import type { Category } from '@/types';

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salario', icon: 'Wallet', color: '#10b981', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'Laptop', color: '#3b82f6', type: 'income' },
  { id: 'investments', name: 'Inversiones', icon: 'TrendingUp', color: '#8b5cf6', type: 'income' },
  { id: 'gift', name: 'Regalos', icon: 'Gift', color: '#f472b6', type: 'income' },
  { id: 'other_income', name: 'Otros Ingresos', icon: 'Plus', color: '#6b7280', type: 'income' },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Alimentación', icon: 'Utensils', color: '#ef4444', type: 'expense' },
  { id: 'transport', name: 'Transporte', icon: 'Car', color: '#f97316', type: 'expense' },
  { id: 'housing', name: 'Vivienda', icon: 'Home', color: '#8b5cf6', type: 'expense' },
  { id: 'entertainment', name: 'Entretenimiento', icon: 'Gamepad2', color: '#ec4899', type: 'expense' },
  { id: 'health', name: 'Salud', icon: 'Heart', color: '#14b8a6', type: 'expense' },
  { id: 'shopping', name: 'Compras', icon: 'ShoppingBag', color: '#f59e0b', type: 'expense' },
  { id: 'education', name: 'Educación', icon: 'BookOpen', color: '#6366f1', type: 'expense' },
  { id: 'utilities', name: 'Servicios', icon: 'Zap', color: '#eab308', type: 'expense' },
  { id: 'other_expense', name: 'Otros Gastos', icon: 'MoreHorizontal', color: '#6b7280', type: 'expense' },
];

export const SAVINGS_CATEGORIES = [
  { id: 'emergency', name: 'Fondo de Emergencia', icon: 'Shield' },
  { id: 'vacation', name: 'Vacaciones', icon: 'Plane' },
  { id: 'car', name: 'Auto', icon: 'Car' },
  { id: 'house', name: 'Casa', icon: 'Home' },
  { id: 'education', name: 'Educación', icon: 'GraduationCap' },
  { id: 'retirement', name: 'Retiro', icon: 'PiggyBank' },
  { id: 'other', name: 'Otro', icon: 'Target' },
];

export const getCategoryById = (id: string) => {
  return [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].find(c => c.id === id);
};
