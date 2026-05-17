import type { Transaction, SavingsGoal, AIInsight, MonthlyStats } from '@/types';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

class AIService {
  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  analyzeSpending(transactions: Transaction[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Filtrar transacciones del mes actual
    const monthlyTransactions = transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    const expenses = monthlyTransactions.filter(t => t.type === 'expense');
    const income = monthlyTransactions.filter(t => t.type === 'income');

    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

    // Análisis de balance mensual
    if (totalIncome > 0 && totalExpense > totalIncome * 0.9) {
      insights.push({
        id: this.generateId(),
        type: 'warning',
        title: 'Gastos Elevados',
        message: `Has gastado el ${((totalExpense / totalIncome) * 100).toFixed(1)}% de tus ingresos este mes. Considera reducir gastos no esenciales.`,
        action: 'Revisar presupuesto',
        priority: 'high',
        createdAt: new Date().toISOString(),
      });
    }

    // Análisis por categorías
    const categoryMap = new Map<string, number>();
    expenses.forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

    // Detectar categoría con mayor gasto
    let maxCategory = '';
    let maxAmount = 0;
    categoryMap.forEach((amount, category) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxCategory = category;
      }
    });

    if (maxCategory && maxAmount > totalIncome * 0.3) {
      insights.push({
        id: this.generateId(),
        type: 'suggestion',
        title: 'Categoría Destacada',
        message: `Tu mayor gasto este mes ha sido en "${maxCategory}" (${maxAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}).`,
        action: 'Ver detalles',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      });
    }

    // Detectar patrones de gasto
    const last3Months = Array.from({ length: 3 }, (_, i) => {
      const month = subMonths(currentMonth, i);
      const monthTx = transactions.filter(t => {
        const date = parseISO(t.date);
        return t.type === 'expense' && 
          isWithinInterval(date, { start: startOfMonth(month), end: endOfMonth(month) });
      });
      return monthTx.reduce((sum, t) => sum + t.amount, 0);
    });

    if (last3Months[0] > last3Months[1] * 1.2 && last3Months[1] > last3Months[2] * 1.2) {
      insights.push({
        id: this.generateId(),
        type: 'warning',
        title: 'Tendencia de Gasto',
        message: 'Tus gastos han aumentado significativamente en los últimos 3 meses.',
        action: 'Crear plan de ahorro',
        priority: 'high',
        createdAt: new Date().toISOString(),
      });
    }

    // Recomendación de ahorro
    if (totalIncome > 0 && totalExpense < totalIncome * 0.7) {
      const potentialSavings = totalIncome * 0.2;
      insights.push({
        id: this.generateId(),
        type: 'tip',
        title: 'Oportunidad de Ahorro',
        message: `¡Excelente! Estás gastando menos del 70% de tus ingresos. Podrías ahorrar ${potentialSavings.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} mensualmente.`,
        action: 'Crear meta de ahorro',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      });
    }

    return insights;
  }

  generateSavingsPlan(transactions: Transaction[], goals: SavingsGoal[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const monthlyIncome = this.calculateAverageMonthlyIncome(transactions);
    
    goals.forEach(goal => {
      const remaining = goal.targetAmount - goal.currentAmount;
      if (remaining > 0 && monthlyIncome > 0) {
        const monthsNeeded = Math.ceil(remaining / (monthlyIncome * 0.2));
        const deadline = goal.deadline ? parseISO(goal.deadline) : null;
        
        if (deadline) {
          const monthsUntilDeadline = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
          
          if (monthsNeeded > monthsUntilDeadline) {
            insights.push({
              id: this.generateId(),
              type: 'warning',
              title: `Meta "${goal.name}" en riesgo`,
              message: `Necesitas ahorrar ${(remaining / monthsUntilDeadline).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} mensualmente para alcanzar tu meta a tiempo.`,
              action: 'Ajustar meta',
              priority: 'high',
              createdAt: new Date().toISOString(),
            });
          } else {
            insights.push({
              id: this.generateId(),
              type: 'achievement',
              title: `Meta "${goal.name}" en camino`,
              message: `Si ahorras el 20% de tus ingresos, alcanzarás tu meta en ${monthsNeeded} meses. ¡Tienes tiempo de sobra!`,
              priority: 'low',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    });

    return insights;
  }

  private calculateAverageMonthlyIncome(transactions: Transaction[]): number {
    const incomeByMonth = new Map<string, number>();
    
    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const month = t.date.substring(0, 7);
        incomeByMonth.set(month, (incomeByMonth.get(month) || 0) + t.amount);
      });

    const values = Array.from(incomeByMonth.values());
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  getMonthlyStats(transactions: Transaction[], months: number = 6): MonthlyStats[] {
    const stats: MonthlyStats[] = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthTransactions = transactions.filter(t => {
        const date = parseISO(t.date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      stats.push({
        month: format(monthDate, 'MMM yyyy', { locale: es }),
        income,
        expense,
        savings: income - expense,
      });
    }

    return stats;
  }

  getCategoryStats(transactions: Transaction[], type: 'income' | 'expense', months: number = 3) {
    const currentDate = new Date();
    const startDate = subMonths(currentDate, months);

    const filtered = transactions.filter(t => {
      const date = parseISO(t.date);
      return t.type === type && date >= startDate;
    });

    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    const categoryMap = new Map<string, { amount: number; count: number }>();

    filtered.forEach(t => {
      const current = categoryMap.get(t.category) || { amount: 0, count: 0 };
      categoryMap.set(t.category, {
        amount: current.amount + t.amount,
        count: current.count + 1,
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: total > 0 ? (data.amount / total) * 100 : 0,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount);
  }
}

export const aiService = new AIService();
