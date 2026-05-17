import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { SavingsGoal } from '@/types';
import { SAVINGS_CATEGORIES } from '@/data/categories';
import { 
  Target, 
  Plus, 
  Trash2, 
  TrendingUp,
  PiggyBank,
  Calendar,
  X,
  Search
} from 'lucide-react';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount'>) => void;
  onDeleteGoal: (id: string) => void;
  onContribute: (id: string, amount: number) => void;
}

export function SavingsGoals({ 
  goals, 
  onAddGoal, 
  onDeleteGoal, 
  onContribute 
}: SavingsGoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    category: 'other',
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredGoals = goals.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;

    onAddGoal({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      deadline: newGoal.deadline || undefined,
      category: newGoal.category,
    });

    setNewGoal({ name: '', targetAmount: '', deadline: '', category: 'other' });
    setShowForm(false);
  };

  const handleContribute = (goalId: string) => {
    if (!contributeAmount) return;
    onContribute(goalId, parseFloat(contributeAmount));
    setContributeAmount('');
    setShowContribute(null);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      maximumFractionDigits: 0 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Metas de Ahorro</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Meta
        </Button>
      </div>

      {goals.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar meta por nombre o categoría..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre de la meta"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="Ej: Vacaciones a la playa"
                required
              />
              <Input
                label="Monto objetivo"
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                placeholder="0.00"
                min="1"
                step="0.01"
                required
              />
              <Select
                label="Categoría"
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                options={SAVINGS_CATEGORIES.map(c => ({ value: c.id, label: c.name }))}
              />
              <Input
                label="Fecha límite (opcional)"
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Crear Meta</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          
          return (
            <Card key={goal.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <Target className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                      <p className="text-sm text-gray-500">{goal.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progreso</span>
                    <span className="font-medium text-primary-600">{progress.toFixed(1)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-gray-500">
                      meta: {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>

                  {goal.deadline && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Fecha límite: {new Date(goal.deadline).toLocaleDateString('es-CO')}
                    </p>
                  )}

                  {progress < 100 && (
                    <>
                      {showContribute === goal.id ? (
                        <div className="flex gap-2 mt-3">
                          <Input
                            type="number"
                            value={contributeAmount}
                            onChange={(e) => setContributeAmount(e.target.value)}
                            placeholder="Monto"
                            min="0"
                            step="0.01"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleContribute(goal.id)}
                          >
                            Agregar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowContribute(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => setShowContribute(goal.id)}
                        >
                          <PiggyBank className="w-4 h-4 mr-2" />
                          Agregar ahorro
                        </Button>
                      )}
                    </>
                  )}

                  {progress >= 100 && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">
                        ¡Meta alcanzada!
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No tienes metas de ahorro aún. Crea tu primera meta para empezar a ahorrar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
