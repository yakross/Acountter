import { useState, useEffect, useCallback } from 'react';
import type { RecurringPayment, Transaction } from '@/types';
import { capacitorStorage } from '@/utils/capacitorStorage';
import { format, addDays, addWeeks, addMonths, parseISO, isBefore, startOfDay } from 'date-fns';
import { LocalNotifications } from '@capacitor/local-notifications';

export function useRecurring() {
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const data = await capacitorStorage.getRecurringPayments();
    setPayments(data);
    setIsLoading(false);
    scheduleNotifications(data);
  };

  const scheduleNotifications = async (currentPayments: RecurringPayment[]) => {
    try {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') return;

      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
      
      const notificationsToSchedule = [];
      let idCounter = 1;
      
      for (const payment of currentPayments) {
        if (!payment.isActive) continue;

        let nextDate = payment.lastProcessed 
          ? parseISO(payment.lastProcessed)
          : parseISO(payment.startDate);

        switch (payment.frequency) {
          case 'daily': nextDate = addDays(nextDate, 1); break;
          case 'weekly': nextDate = addWeeks(nextDate, 1); break;
          case 'biweekly': nextDate = addWeeks(nextDate, 2); break;
          case 'monthly': nextDate = addMonths(nextDate, 1); break;
        }
        
        const scheduleDate = new Date(nextDate);
        scheduleDate.setHours(9, 0, 0, 0);
        
        if (scheduleDate.getTime() > Date.now()) {
          notificationsToSchedule.push({
            title: 'Pago Recurrente',
            body: `Hoy vence tu pago: ${payment.name}`,
            id: idCounter++,
            schedule: { at: scheduleDate }
          });
        }
      }
      
      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      }
    } catch (e) {
      console.error('Error scheduling notifications', e);
    }
  };

  const addPayment = useCallback(async (payment: Omit<RecurringPayment, 'id' | 'createdAt' | 'isActive'>) => {
    const newPayment: RecurringPayment = {
      ...payment,
      id: crypto.randomUUID(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...payments, newPayment];
    setPayments(updated);
    await capacitorStorage.saveRecurringPayments(updated);
    scheduleNotifications(updated);
    return newPayment;
  }, [payments]);

  const updatePayment = useCallback(async (id: string, updates: Partial<RecurringPayment>) => {
    const updated = payments.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    setPayments(updated);
    await capacitorStorage.saveRecurringPayments(updated);
    scheduleNotifications(updated);
  }, [payments]);

  const deletePayment = useCallback(async (id: string) => {
    const updated = payments.filter(p => p.id !== id);
    setPayments(updated);
    await capacitorStorage.saveRecurringPayments(updated);
    scheduleNotifications(updated);
  }, [payments]);

  const toggleActive = useCallback(async (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (payment) {
      await updatePayment(id, { isActive: !payment.isActive });
    }
  }, [payments, updatePayment]);

  // Process recurring payments and generate transactions
  const processRecurringPayments = useCallback(async (): Promise<Transaction[]> => {
    const today = startOfDay(new Date());
    const generatedTransactions: Transaction[] = [];

    for (const payment of payments) {
      if (!payment.isActive) continue;

      let nextDate = payment.lastProcessed 
        ? parseISO(payment.lastProcessed)
        : parseISO(payment.startDate);

      // Calculate next occurrence based on frequency
      switch (payment.frequency) {
        case 'daily':
          nextDate = addDays(nextDate, 1);
          break;
        case 'weekly':
          nextDate = addWeeks(nextDate, 1);
          break;
        case 'biweekly':
          nextDate = addWeeks(nextDate, 2);
          break;
        case 'monthly':
          nextDate = addMonths(nextDate, 1);
          break;
      }

      // Check if payment should be processed
      if (isBefore(nextDate, today)) {
        const transaction: Transaction = {
          id: crypto.randomUUID(),
          amount: payment.amount,
          description: `${payment.name} (Recurrente)`,
          category: payment.category,
          type: payment.type,
          date: format(nextDate, 'yyyy-MM-dd'),
          createdAt: new Date().toISOString(),
        };

        generatedTransactions.push(transaction);
        
        await updatePayment(payment.id, { 
          lastProcessed: format(nextDate, 'yyyy-MM-dd') 
        });
      }
    }

    return generatedTransactions;
  }, [payments, updatePayment]);

  const getFrequencyLabel = (frequency: string): string => {
    const labels: Record<string, string> = {
      daily: 'Diario',
      weekly: 'Semanal',
      biweekly: 'Quincenal',
      monthly: 'Mensual',
    };
    return labels[frequency] || frequency;
  };

  const getActivePayments = useCallback(() => {
    return payments.filter(p => p.isActive);
  }, [payments]);

  const getPaymentsByFrequency = useCallback((frequency: string) => {
    return payments.filter(p => p.frequency === frequency && p.isActive);
  }, [payments]);

  return {
    payments,
    isLoading,
    addPayment,
    updatePayment,
    deletePayment,
    toggleActive,
    processRecurringPayments,
    getFrequencyLabel,
    getActivePayments,
    getPaymentsByFrequency,
  };
}
