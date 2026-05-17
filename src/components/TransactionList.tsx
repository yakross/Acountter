import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EditTransactionModal } from '@/contexts/EditTransactionModal';
import type { Transaction } from '@/types';
import { Trash2, ArrowUpCircle, ArrowDownCircle, Pencil, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/categories';
import { useCurrency } from '@/contexts/CurrencyContext';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
}

export function TransactionList({ transactions, onDelete, onUpdate }: TransactionListProps) {
  const { format: formatCurrency } = useCurrency();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const getCategoryColor = (category: string, type: 'income' | 'expense') => {
    const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return cats.find(c => c.name === category)?.color ?? '#6b7280';
  };

  const sorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...transactions]
      .filter(t => {
        if (filter !== 'all' && t.type !== filter) return false;
        if (!q) return true;
        return (
          t.description?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter, search]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>Historial de Transacciones</CardTitle>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'income', 'expense'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filter === f
                        ? f === 'all'
                          ? 'bg-gray-800 text-white'
                          : f === 'income'
                          ? 'bg-finance-income text-white'
                          : 'bg-finance-expense text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'Todos' : f === 'income' ? 'Ingresos' : 'Gastos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por descripción o categoría…"
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
            {sorted.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                {search ? 'No hay resultados para tu búsqueda.' : 'No hay transacciones registradas.'}
              </p>
            ) : (
              sorted.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  {/* Left */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${
                        tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpCircle className="w-5 h-5 text-finance-income" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-finance-expense" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {tx.description || tx.category}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getCategoryColor(tx.category, tx.type) }}
                        />
                        <span className="truncate">{tx.category}</span>
                        <span>•</span>
                        <span className="flex-shrink-0">
                          {format(parseISO(tx.date), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span
                      className={`font-semibold text-sm ${
                        tx.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>

                    {/* Edit button — visible on hover (desktop) or always on mobile */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTx(tx)}
                      className="p-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label="Editar transacción"
                    >
                      <Pencil className="w-4 h-4 text-primary-600" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(tx.id)}
                      className="p-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label="Eliminar transacción"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit modal (portal-like, rendered outside the list) */}
      <EditTransactionModal
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onSave={onUpdate}
      />
    </>
  );
}
