import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Budget } from '@/types';
import { 
  Plus, 
  Trash2, 
  AlertTriangle,
  Settings2,
  Target,
  PieChart
} from 'lucide-react';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from 'recharts';

interface BudgetManagerProps {
  budgets: Budget[];
  monthlyIncome: number;
  onDeleteBudget: (id: string) => void;
  onApply503020: (income: number) => void;
  onCreateCustom: (name: string, percentages: { name: string; percentage: number }[], income: number) => void;
  getBudgetStatus: (budget: Budget) => { percentage: number; remaining: number; isOverBudget: boolean; isNearLimit: boolean; status: string };
}

export function BudgetManager({
  budgets,
  monthlyIncome,
  onDeleteBudget,
  onApply503020,
  onCreateCustom,
  getBudgetStatus,
}: BudgetManagerProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customAllocations, setCustomAllocations] = useState([{ name: '', percentage: '' }]);
  const [customName, setCustomName] = useState('');

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'exceeded': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  const addCustomAllocation = () => {
    setCustomAllocations([...customAllocations, { name: '', percentage: '' }]);
  };

  const removeCustomAllocation = (index: number) => {
    if (customAllocations.length > 1) {
      setCustomAllocations(customAllocations.filter((_, i) => i !== index));
    }
  };

  const updateCustomAllocation = (index: number, field: 'name' | 'percentage', value: string) => {
    const updated = [...customAllocations];
    updated[index][field] = value;
    setCustomAllocations(updated);
  };

  const handleCreateCustom = () => {
    const total = customAllocations.reduce((sum, item) => sum + (parseFloat(item.percentage) || 0), 0);
    if (total !== 100) {
      alert(`Los porcentajes deben sumar 100%. Actual: ${total}%`);
      return;
    }

    const validAllocations = customAllocations
      .filter(item => item.name && item.percentage)
      .map(item => ({ name: item.name, percentage: parseFloat(item.percentage) }));

    onCreateCustom(customName, validAllocations, monthlyIncome);
    setShowCustomForm(false);
    setCustomAllocations([{ name: '', percentage: '' }]);
    setCustomName('');
  };

  const chartData = budgets.map((b, i) => ({
    name: b.name,
    value: b.amount,
    spent: b.spent,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Presupuestos por %</h2>
        {monthlyIncome > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Ingreso mensual</p>
            <p className="text-lg font-semibold text-finance-income">{formatCurrency(monthlyIncome)}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onApply503020(monthlyIncome)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Regla 50/30/20</h3>
                <p className="text-sm text-gray-500">50% Necesidades • 30% Deseos • 20% Ahorros</p>
              </div>
              <Button size="sm">Aplicar</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCustomForm(!showCustomForm)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Settings2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Personalizado</h3>
                <p className="text-sm text-gray-500">Define tus propios porcentajes</p>
              </div>
              <Button size="sm" variant="outline">
                {showCustomForm ? 'Cerrar' : 'Crear'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Form */}
      {showCustomForm && (
        <Card>
          <CardHeader>
            <CardTitle>Presupuesto Personalizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Nombre del presupuesto"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ej: Mi Presupuesto 2024"
              />
              
              {customAllocations.map((allocation, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <Input
                    label={index === 0 ? 'Categoría' : ''}
                    value={allocation.name}
                    onChange={(e) => updateCustomAllocation(index, 'name', e.target.value)}
                    placeholder="Nombre de categoría"
                    className="flex-1"
                  />
                  <Input
                    label={index === 0 ? '%' : ''}
                    type="number"
                    value={allocation.percentage}
                    onChange={(e) => updateCustomAllocation(index, 'percentage', e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                    className="w-24"
                  />
                  <button
                    onClick={() => removeCustomAllocation(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg mb-0"
                    disabled={customAllocations.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between">
                <button
                  onClick={addCustomAllocation}
                  className="text-primary-600 text-sm font-medium hover:text-primary-700"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Agregar categoría
                </button>
                <span className="text-sm text-gray-500">
                  Total: {customAllocations.reduce((sum, item) => sum + (parseFloat(item.percentage) || 0), 0)}%
                </span>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateCustom} className="flex-1">
                  Crear Presupuesto
                </Button>
                <Button variant="outline" onClick={() => setShowCustomForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Chart */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución del Presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Presupuestado</span>
                  <span className="font-semibold">{formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0))}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Gastado</span>
                  <span className="font-semibold text-finance-expense">{formatCurrency(budgets.reduce((sum, b) => sum + b.spent, 0))}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700">Disponible</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(budgets.reduce((sum, b) => sum + (b.amount - b.spent), 0))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget List */}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No tienes presupuestos configurados. Selecciona una plantilla arriba o crea uno personalizado.
              </p>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget, index) => {
            const status = getBudgetStatus(budget);
            return (
              <Card key={budget.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        status.status === 'good' ? 'bg-green-100 text-green-700' :
                        status.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {status.percentage.toFixed(0)}%
                      </span>
                      <button
                        onClick={() => onDeleteBudget(budget.id)}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {formatCurrency(budget.spent)} de {formatCurrency(budget.amount)}
                      </span>
                      <span className={`font-medium ${
                        status.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {status.remaining >= 0 ? '+' : ''}{formatCurrency(status.remaining)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getStatusColor(status.status)}`}
                        style={{ width: `${Math.min(status.percentage, 100)}%` }}
                      />
                    </div>
                    {status.isNearLimit && !status.isOverBudget && (
                      <p className="text-xs text-yellow-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Cerca del límite ({status.percentage.toFixed(0)}%)
                      </p>
                    )}
                    {status.isOverBudget && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        ¡Has excedido el presupuesto!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
