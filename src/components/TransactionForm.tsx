import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { TransactionType } from '@/types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/data/categories';
import { PlusCircle } from 'lucide-react';

interface TransactionFormProps {
  onSubmit: (transaction: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    date: string;
  }) => void;
}

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    onSubmit({
      amount: parseFloat(amount),
      description,
      category,
      type,
      date,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Nueva Transacción
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(''); }}
              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                type === 'income' 
                  ? 'bg-finance-income text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(''); }}
              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                type === 'expense' 
                  ? 'bg-finance-expense text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gasto
            </button>
          </div>

          <Input
            label="Monto"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />

          <Input
            label="Descripción"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Compra supermercado"
          />

          <Select
            label="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: '', label: 'Selecciona una categoría' },
              ...categories.map(c => ({ value: c.name, label: c.name }))
            ]}
            required
          />

          <Input
            label="Fecha"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Button type="submit" className="w-full">
            Guardar {type === 'income' ? 'Ingreso' : 'Gasto'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
