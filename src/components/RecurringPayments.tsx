import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { RecurringPayment, TransactionType, RecurringFrequency } from '@/types';
import { 
  Repeat, 
  Plus, 
  Trash2, 
  Calendar,
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/data/categories';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecurringPaymentsProps {
  payments: RecurringPayment[];
  onAddPayment: (payment: Omit<RecurringPayment, 'id' | 'createdAt' | 'isActive'>) => void;
  onDeletePayment: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function RecurringPayments({ 
  payments, 
  onAddPayment, 
  onDeletePayment, 
  onToggleActive 
}: RecurringPaymentsProps) {
  const [showForm, setShowForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    name: '',
    amount: '',
    type: 'expense' as TransactionType,
    category: '',
    frequency: 'monthly' as RecurringFrequency,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.name || !newPayment.amount || !newPayment.category) return;

    onAddPayment({
      name: newPayment.name,
      amount: parseFloat(newPayment.amount),
      type: newPayment.type,
      category: newPayment.category,
      frequency: newPayment.frequency,
      startDate: newPayment.startDate,
      endDate: newPayment.endDate || undefined,
    });

    setNewPayment({
      name: '',
      amount: '',
      type: 'expense',
      category: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setShowForm(false);
  };

  const categories = newPayment.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const getFrequencyLabel = (freq: RecurringFrequency) => {
    const labels: Record<RecurringFrequency, string> = {
      daily: 'Diario',
      weekly: 'Semanal',
      biweekly: 'Quincenal',
      monthly: 'Mensual',
    };
    return labels[freq];
  };

  const getFrequencyIcon = (freq: RecurringFrequency) => {
    switch (freq) {
      case 'daily': return <span className="text-xs">D</span>;
      case 'weekly': return <span className="text-xs">S</span>;
      case 'biweekly': return <span className="text-xs">Q</span>;
      case 'monthly': return <span className="text-xs">M</span>;
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Pagos Recurrentes</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pago
        </Button>
      </div>

      {payments.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="expense">Gastos</option>
              <option value="income">Ingresos</option>
            </select>
          </div>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Pago Recurrente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setNewPayment({ ...newPayment, type: 'income', category: '' })}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    newPayment.type === 'income' 
                      ? 'bg-finance-income text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Ingreso
                </button>
                <button
                  type="button"
                  onClick={() => setNewPayment({ ...newPayment, type: 'expense', category: '' })}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                    newPayment.type === 'expense' 
                      ? 'bg-finance-expense text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Gasto
                </button>
              </div>

              <Input
                label="Nombre del pago"
                value={newPayment.name}
                onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                placeholder="Ej: Alquiler, Salario, Netflix"
                required
              />

              <Input
                label="Monto"
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />

              <Select
                label="Frecuencia"
                value={newPayment.frequency}
                onChange={(e) => setNewPayment({ ...newPayment, frequency: e.target.value as RecurringFrequency })}
                options={[
                  { value: 'daily', label: 'Diario' },
                  { value: 'weekly', label: 'Semanal' },
                  { value: 'biweekly', label: 'Quincenal' },
                  { value: 'monthly', label: 'Mensual' },
                ]}
              />

              <Select
                label="Categoría"
                value={newPayment.category}
                onChange={(e) => setNewPayment({ ...newPayment, category: e.target.value })}
                options={[
                  { value: '', label: 'Selecciona una categoría' },
                  ...categories.map(c => ({ value: c.name, label: c.name }))
                ]}
                required
              />

              <Input
                label="Fecha de inicio"
                type="date"
                value={newPayment.startDate}
                onChange={(e) => setNewPayment({ ...newPayment, startDate: e.target.value })}
                required
              />

              <Input
                label="Fecha de fin (opcional)"
                type="date"
                value={newPayment.endDate}
                onChange={(e) => setNewPayment({ ...newPayment, endDate: e.target.value })}
              />

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Crear Pago Recurrente</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {payments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Repeat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No tienes pagos recurrentes configurados. Crea uno para automatizar tus finanzas.
              </p>
            </CardContent>
          </Card>
        ) : filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No se encontraron resultados para tu búsqueda.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map(payment => (
            <Card key={payment.id} className={`relative ${!payment.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      payment.isActive ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      {payment.isActive ? (
                        <Repeat className="w-5 h-5 text-primary-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{payment.name}</h3>
                      <p className="text-sm text-gray-500">{payment.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      payment.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
                    }`}>
                      {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {getFrequencyIcon(payment.frequency)}
                      {getFrequencyLabel(payment.frequency)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Inicio: {format(parseISO(payment.startDate), 'dd MMM yyyy', { locale: es })}
                    {payment.lastProcessed && (
                      <span className="ml-3 text-primary-600">
                        <CheckCircle2 className="w-4 h-4 inline mr-1" />
                        Último: {format(parseISO(payment.lastProcessed), 'dd MMM yyyy', { locale: es })}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleActive(payment.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title={payment.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {payment.isActive ? (
                        <Bell className="w-4 h-4 text-primary-600" />
                      ) : (
                        <BellOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeletePayment(payment.id)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
