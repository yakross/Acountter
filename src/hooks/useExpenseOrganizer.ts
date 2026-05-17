import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Transaction } from '@/types';
import { capacitorStorage } from '@/utils/capacitorStorage';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';

const ORGANIZER_KEY = 'finance_expense_organizer';

export type OrganizationMethod = 'envelope' | 'priority' | 'project' | 'zero-based' | 'envelope-detailed';
export type TimePeriod = 'weekly' | 'monthly' | 'yearly';

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  allocated: number;
  spent: number;
  priority: 'high' | 'medium' | 'low';
  isEssential: boolean;
  parentId?: string;
}

export interface OrganizationTemplate {
  id: string;
  name: string;
  method: OrganizationMethod;
  description: string;
  defaultCategories: Omit<ExpenseCategory, 'id' | 'spent'>[];
}

export interface OrganizerSettings {
  method: OrganizationMethod;
  period: TimePeriod;
  categories: ExpenseCategory[];
  totalBudget: number;
  startDate: string;
}

const DEFAULT_TEMPLATES: OrganizationTemplate[] = [
  {
    id: 'envelope',
    name: 'Método de Sobres',
    method: 'envelope',
    description: 'Divide tu dinero en categorías virtuales (sobres)',
    defaultCategories: [
      { name: 'Vivienda', color: '#ef4444', icon: 'Home', allocated: 0, priority: 'high', isEssential: true },
      { name: 'Alimentación', color: '#f97316', icon: 'UtensilsCrossed', allocated: 0, priority: 'high', isEssential: true },
      { name: 'Transporte', color: '#3b82f6', icon: 'Car', allocated: 0, priority: 'medium', isEssential: true },
      { name: 'Entretenimiento', color: '#8b5cf6', icon: 'Gamepad2', allocated: 0, priority: 'low', isEssential: false },
      { name: 'Ahorro', color: '#10b981', icon: 'PiggyBank', allocated: 0, priority: 'high', isEssential: true },
    ],
  },
  {
    id: 'priority',
    name: 'Por Prioridades',
    method: 'priority',
    description: 'Organiza gastos por nivel de importancia',
    defaultCategories: [
      { name: 'Necesidades Básicas', color: '#dc2626', icon: 'AlertCircle', allocated: 0, priority: 'high', isEssential: true },
      { name: 'Deudas/Emergencias', color: '#ea580c', icon: 'ShieldAlert', allocated: 0, priority: 'high', isEssential: true },
      { name: 'Metas de Ahorro', color: '#16a34a', icon: 'Target', allocated: 0, priority: 'high', isEssential: true },
      { name: 'Ocio y Hobbies', color: '#7c3aed', icon: 'Sparkles', allocated: 0, priority: 'low', isEssential: false },
      { name: 'Desarrollo Personal', color: '#0891b2', icon: 'BookOpen', allocated: 0, priority: 'medium', isEssential: false },
    ],
  },
  {
    id: 'project',
    name: 'Por Proyectos',
    method: 'project',
    description: 'Agrupa gastos relacionados con proyectos específicos',
    defaultCategories: [
      { name: 'Renovación Casa', color: '#f59e0b', icon: 'Home', allocated: 0, priority: 'medium', isEssential: false },
      { name: 'Vacaciones', color: '#06b6d4', icon: 'Plane', allocated: 0, priority: 'low', isEssential: false },
      { name: 'Educación', color: '#8b5cf6', icon: 'GraduationCap', allocated: 0, priority: 'high', isEssential: true },
      { name: 'Negocio', color: '#ec4899', icon: 'Briefcase', allocated: 0, priority: 'high', isEssential: true },
    ],
  },
  {
    id: 'zero-based',
    name: 'Presupuesto Cero',
    method: 'zero-based',
    description: 'Asigna cada peso a una categoría hasta llegar a cero',
    defaultCategories: [
      { name: 'Gastos Fijos', color: '#dc2626', icon: 'Receipt', allocated: 0, priority: 'high', isEssential: true },
      { name: 'Gastos Variables', color: '#f97316', icon: 'ShoppingBag', allocated: 0, priority: 'medium', isEssential: true },
      { name: 'Inversiones', color: '#10b981', icon: 'TrendingUp', allocated: 0, priority: 'medium', isEssential: false },
      { name: 'Fondo de Emergencia', color: '#3b82f6', icon: 'Umbrella', allocated: 0, priority: 'high', isEssential: true },
    ],
  },
  {
    id: 'envelope-detailed',
    name: 'Sobres Detallado',
    method: 'envelope-detailed',
    description: 'Sistema de sobres con subcategorías',
    defaultCategories: [
      { name: 'Vivienda', color: '#ef4444', icon: 'Home', allocated: 0, priority: 'high', isEssential: true },
      { name: 'Servicios (Agua/Luz)', color: '#fca5a5', icon: 'Zap', allocated: 0, priority: 'high', isEssential: true, parentId: 'vivienda' },
      { name: 'Internet', color: '#fca5a5', icon: 'Wifi', allocated: 0, priority: 'medium', isEssential: true, parentId: 'vivienda' },
      { name: 'Alimentación', color: '#f97316', icon: 'UtensilsCrossed', allocated: 0, priority: 'high', isEssential: true },
      { name: 'Supermercado', color: '#fdba74', icon: 'ShoppingCart', allocated: 0, priority: 'high', isEssential: true, parentId: 'alimentacion' },
      { name: 'Restaurantes', color: '#fdba74', icon: 'Coffee', allocated: 0, priority: 'low', isEssential: false, parentId: 'alimentacion' },
      { name: 'Transporte', color: '#3b82f6', icon: 'Car', allocated: 0, priority: 'medium', isEssential: true },
      { name: 'Gasolina', color: '#93c5fd', icon: 'Fuel', allocated: 0, priority: 'medium', isEssential: true, parentId: 'transporte' },
      { name: 'Mantenimiento', color: '#93c5fd', icon: 'Wrench', allocated: 0, priority: 'medium', isEssential: false, parentId: 'transporte' },
    ],
  },
];

export function useExpenseOrganizer(transactions: Transaction[]) {
  const [settings, setSettings] = useState<OrganizerSettings>({
    method: 'envelope',
    period: 'monthly',
    categories: [],
    totalBudget: 0,
    startDate: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await capacitorStorage.getItem<OrganizerSettings>(ORGANIZER_KEY);
    if (saved) {
      setSettings(saved);
    }
    setIsLoading(false);
  };

  const saveSettings = async (newSettings: OrganizerSettings) => {
    await capacitorStorage.setItem(ORGANIZER_KEY, newSettings);
    setSettings(newSettings);
  };

  const applyTemplate = useCallback((templateId: string, totalBudget: number) => {
    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const categories: ExpenseCategory[] = template.defaultCategories.map(cat => ({
      ...cat,
      id: crypto.randomUUID(),
      spent: 0,
      allocated: 0,
    }));

    // Distribute budget equally initially
    const baseAmount = totalBudget / categories.filter(c => !c.parentId).length;
    const updatedCategories = categories.map(cat => ({
      ...cat,
      allocated: cat.parentId ? 0 : baseAmount,
    }));

    const newSettings: OrganizerSettings = {
      method: template.method,
      period: 'monthly',
      categories: updatedCategories,
      totalBudget,
      startDate: new Date().toISOString().split('T')[0],
    };

    saveSettings(newSettings);
  }, []);

  const updateCategoryAllocation = useCallback((categoryId: string, amount: number) => {
    const updated = settings.categories.map(cat =>
      cat.id === categoryId ? { ...cat, allocated: amount } : cat
    );
    const newSettings = { ...settings, categories: updated };
    saveSettings(newSettings);
  }, [settings]);

  const updateSpending = useCallback(() => {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (settings.period) {
      case 'weekly':
        periodStart = startOfWeek(now);
        periodEnd = endOfWeek(now);
        break;
      case 'yearly':
        periodStart = startOfYear(now);
        periodEnd = endOfYear(now);
        break;
      default:
        periodStart = startOfMonth(now);
        periodEnd = endOfMonth(now);
    }

    const updatedCategories = settings.categories.map(category => {
      const spent = transactions
        .filter(t => {
          const date = parseISO(t.date);
          return t.type === 'expense' &&
            isWithinInterval(date, { start: periodStart, end: periodEnd }) &&
            (t.category === category.name || t.category.includes(category.name));
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return { ...category, spent };
    });

    const newSettings = { ...settings, categories: updatedCategories };
    saveSettings(newSettings);
  }, [settings, transactions]);

  const addCustomCategory = useCallback((category: Omit<ExpenseCategory, 'id' | 'spent'>) => {
    const newCategory: ExpenseCategory = {
      ...category,
      id: crypto.randomUUID(),
      spent: 0,
    };
    const newSettings = {
      ...settings,
      categories: [...settings.categories, newCategory],
    };
    saveSettings(newSettings);
  }, [settings]);

  const removeCategory = useCallback((categoryId: string) => {
    const newSettings = {
      ...settings,
      categories: settings.categories.filter(c => c.id !== categoryId && c.parentId !== categoryId),
    };
    saveSettings(newSettings);
  }, [settings]);

  const getCategoryStatus = useCallback((category: ExpenseCategory) => {
    const percentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
    const remaining = category.allocated - category.spent;
    
    return {
      percentage,
      remaining,
      isOverBudget: percentage > 100,
      isNearLimit: percentage >= 80,
      canSpend: remaining > 0,
    };
  }, []);

  const stats = useMemo(() => {
    const totalAllocated = settings.categories.reduce((sum, c) => sum + c.allocated, 0);
    const totalSpent = settings.categories.reduce((sum, c) => sum + c.spent, 0);
    const remainingBudget = settings.totalBudget - totalAllocated;
    
    return {
      totalAllocated,
      totalSpent,
      remainingBudget,
      utilizationRate: settings.totalBudget > 0 ? (totalAllocated / settings.totalBudget) * 100 : 0,
    };
  }, [settings]);

  return {
    settings,
    templates: DEFAULT_TEMPLATES,
    isLoading,
    stats,
    applyTemplate,
    updateCategoryAllocation,
    updateSpending,
    addCustomCategory,
    removeCategory,
    getCategoryStatus,
    saveSettings,
  };
}
