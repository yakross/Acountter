import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Transaction, TransactionType } from '@/types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/data/categories';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
}

export function EditTransactionModal({
  transaction,
  onClose,
  onSave,
}: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');

  // Populate fields when transaction changes
  useEffect(() => {
    if (!transaction) return;
    setType(transaction.type);
    setAmount(String(transaction.amount));
    setDescription(transaction.description ?? '');
    setCategory(transaction.category);
    setDate(transaction.date);
  }, [transaction]);

  if (!transaction) return null;

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(''); // reset so user picks a valid category for the new type
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;
    onSave(transaction.id, {
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
    });
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal panel */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Editar transacción</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
                type === 'income'
                  ? 'bg-finance-income text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
                type === 'expense'
                  ? 'bg-finance-expense text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Gasto
            </button>
          </div>

          <Input
            label="Monto"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0"
            step="0.01"
            required
          />

          <Input
            label="Descripción"
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ej: Compra supermercado"
          />

          <Select
            label="Categoría"
            value={category}
            onChange={e => setCategory(e.target.value)}
            options={[
              { value: '', label: 'Selecciona una categoría' },
              ...categories.map(c => ({ value: c.name, label: c.name })),
            ]}
            required
          />

          <Input
            label="Fecha"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
