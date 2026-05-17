import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { OrganizationTemplate, ExpenseCategory } from '@/hooks/useExpenseOrganizer';
import { 
  Wallet, 
  Target, 
  FolderOpen, 
  Calculator, 
  Layers,
  Plus,
  Trash2,
  Home,
  UtensilsCrossed,
  Car,
  Gamepad2,
  PiggyBank,
  AlertTriangle,
  ShieldAlert,
  BookOpen,
  Sparkles,
  Plane,
  GraduationCap,
  Briefcase,
  ShoppingCart,
  Coffee,
  Fuel,
  Wrench,
  Zap,
  Wifi,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Umbrella,
  TargetIcon
} from 'lucide-react';

interface ExpenseOrganizerProps {
  templates: OrganizationTemplate[];
  currentCategories: ExpenseCategory[];
  totalBudget: number;
  onApplyTemplate: (templateId: string, budget: number) => void;
  onUpdateAllocation: (categoryId: string, amount: number) => void;
  onAddCategory: (category: Omit<ExpenseCategory, 'id' | 'spent'>) => void;
  onRemoveCategory: (categoryId: string) => void;
  stats: {
    totalAllocated: number;
    totalSpent: number;
    remainingBudget: number;
    utilizationRate: number;
  };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  UtensilsCrossed,
  Car,
  Gamepad2,
  PiggyBank,
  AlertTriangle,
  ShieldAlert,
  TargetIcon,
  Sparkles,
  BookOpen,
  Plane,
  GraduationCap,
  Briefcase,
  ShoppingCart,
  Coffee,
  Fuel,
  Wrench,
  Zap,
  Wifi,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Umbrella,
};

export function ExpenseOrganizer({
  templates,
  currentCategories,
  totalBudget,
  onApplyTemplate,
  onUpdateAllocation,
  onAddCategory,
  onRemoveCategory,
  stats,
}: ExpenseOrganizerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [budgetInput, setBudgetInput] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    allocated: '',
    priority: 'medium' as const,
    isEssential: false,
  });

  const handleApplyTemplate = () => {
    if (selectedTemplate && budgetInput) {
      onApplyTemplate(selectedTemplate, parseFloat(budgetInput));
      setSelectedTemplate('');
      setBudgetInput('');
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.allocated) {
      onAddCategory({
        name: newCategory.name,
        allocated: parseFloat(newCategory.allocated),
        priority: newCategory.priority,
        isEssential: newCategory.isEssential,
        color: '#6366f1',
        icon: 'Wallet',
      });
      setNewCategory({ name: '', allocated: '', priority: 'medium', isEssential: false });
      setShowCustomForm(false);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (percentage: number, remaining: number) => {
    if (percentage >= 100) return `¡Excedido por ${Math.abs(remaining).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}!`;
    if (percentage >= 80) return `Cerca del límite - ${remaining.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} restantes`;
    return `${remaining.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })} disponibles`;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Organización de Gastos</h2>
        <div className="text-right">
          <p className="text-sm text-gray-500">Presupuesto Total</p>
          <p className="text-lg font-semibold text-finance-income">{formatCurrency(totalBudget)}</p>
        </div>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Método de Organización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  selectedTemplate === template.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    {template.method === 'envelope' && <Wallet className="w-5 h-5 text-primary-600" />}
                    {template.method === 'priority' && <Target className="w-5 h-5 text-primary-600" />}
                    {template.method === 'project' && <FolderOpen className="w-5 h-5 text-primary-600" />}
                    {template.method === 'zero-based' && <Calculator className="w-5 h-5 text-primary-600" />}
                    {template.method === 'envelope-detailed' && <Layers className="w-5 h-5 text-primary-600" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {template.defaultCategories.length} categorías
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedTemplate && (
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Presupuesto total"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleApplyTemplate}>
                Aplicar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {currentCategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Asignado</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalAllocated)}</p>
              <p className="text-xs text-gray-400">
                {stats.utilizationRate.toFixed(0)}% del presupuesto
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Gastado</p>
              <p className="text-xl font-bold text-finance-expense">{formatCurrency(stats.totalSpent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Disponible</p>
              <p className="text-xl font-bold text-finance-income">{formatCurrency(stats.totalAllocated - stats.totalSpent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Sin asignar</p>
              <p className={`text-xl font-bold ${stats.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.remainingBudget)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories */}
      {currentCategories.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Categorías</CardTitle>
            <Button size="sm" onClick={() => setShowCustomForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentCategories.map((category) => {
                const percentage = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
                const remaining = category.allocated - category.spent;
                const IconComponent = iconMap[category.icon] || Wallet;

                return (
                  <div key={category.id} className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded ${
                              category.priority === 'high' ? 'bg-red-100 text-red-700' :
                              category.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {category.priority === 'high' ? 'Alta' : category.priority === 'medium' ? 'Media' : 'Baja'}
                            </span>
                            {category.isEssential && (
                              <span className="text-blue-600">Esencial</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveCategory(category.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                        </span>
                        <span className={`font-medium ${
                          percentage >= 100 ? 'text-red-600' : percentage >= 80 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getStatusColor(percentage)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {getStatusText(percentage, remaining)}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Nueva asignación"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          onChange={(e) => onUpdateAllocation(category.id, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Custom Category Form */}
      {showCustomForm && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Categoría Personalizada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Nombre"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Ej: Gym, Medicinas, etc."
              />
              <Input
                label="Monto asignado"
                type="number"
                value={newCategory.allocated}
                onChange={(e) => setNewCategory({ ...newCategory, allocated: e.target.value })}
                placeholder="0.00"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Prioridad</label>
                <select
                  value={newCategory.priority}
                  onChange={(e) => setNewCategory({ ...newCategory, priority: e.target.value as any })}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
                >
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCategory.isEssential}
                  onChange={(e) => setNewCategory({ ...newCategory, isEssential: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Gasto esencial</span>
              </label>
              <div className="flex gap-2">
                <Button onClick={handleAddCategory} className="flex-1">Agregar</Button>
                <Button variant="outline" onClick={() => setShowCustomForm(false)}>Cancelar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
