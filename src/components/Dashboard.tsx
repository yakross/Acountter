import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, PiggyBank, Wallet, AlertTriangle } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useSavings } from '@/hooks/useSavings';
import { useAI } from '@/hooks/useAI';
import { useBudgets } from '@/hooks/useBudgets';
import { useCurrency } from '@/contexts/CurrencyContext';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { EXPENSE_CATEGORIES } from '@/data/categories';

export function Dashboard() {
  const { transactions, getBalance, getMonthlyTotals } = useTransactions();
  const { getTotalSaved } = useSavings();
  const { monthlyStats, expenseStats } = useAI(transactions, []);
  const { budgets, getBudgetStatus } = useBudgets(transactions);
  const { format: formatCurrency } = useCurrency();

  const currentMonth = format(new Date(), 'yyyy-MM');
  const { income, expense } = getMonthlyTotals(currentMonth);
  const balance = getBalance();
  const totalSavings = getTotalSaved();

  const COLORS = EXPENSE_CATEGORIES.map(c => c.color);

  // Budgets near or over their limit this month
  const alertBudgets = budgets
    .map(b => ({ b, status: getBudgetStatus(b) }))
    .filter(({ status }) => status.isNearLimit || status.isOverBudget)
    .slice(0, 3);

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const budgetPercentage = totalBudgeted > 0 ? (totalBudgetSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Budget alerts */}
      {alertBudgets.length > 0 && (
        <div className="space-y-2">
          {alertBudgets.map(({ b, status }) => (
            <div
              key={b.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                status.isOverBudget
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>{b.name}</strong>:{' '}
                {status.isOverBudget
                  ? `Excediste el presupuesto por ${formatCurrency(Math.abs(status.remaining))}`
                  : `Has usado el ${Math.round(status.percentage)}% del presupuesto`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Budget consumption progress */}
      {totalBudgeted > 0 && (
        <Card className="bg-gradient-to-r from-primary-900 to-primary-800 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    className="text-white/20"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className="text-white drop-shadow-md transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (Math.min(budgetPercentage, 100) / 100) * 251.2}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{Math.round(budgetPercentage)}%</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Presupuesto del mes</h3>
                <p className="text-primary-100 text-sm mb-2">
                  Has gastado <span className="font-bold">{formatCurrency(totalBudgetSpent)}</span> de <span className="font-bold">{formatCurrency(totalBudgeted)}</span>.
                </p>
                {budgetPercentage >= 90 ? (
                  <p className="text-red-300 text-sm font-medium flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> ¡Estás muy cerca del límite!
                  </p>
                ) : budgetPercentage >= 75 ? (
                  <p className="text-yellow-300 text-sm font-medium flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Precaución, modera tus gastos.
                  </p>
                ) : (
                  <p className="text-green-300 text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Vas por buen camino.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-finance-income">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Balance Total</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-finance-income' : 'text-finance-expense'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Wallet className="w-6 h-6 text-finance-income" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-finance-income">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos del Mes</p>
                <p className="text-2xl font-bold text-finance-income">{formatCurrency(income)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-finance-income" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-finance-expense">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gastos del Mes</p>
                <p className="text-2xl font-bold text-finance-expense">{formatCurrency(expense)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-finance-expense" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-finance-savings">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ahorrado</p>
                <p className="text-2xl font-bold text-finance-savings">{formatCurrency(totalSavings)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <PiggyBank className="w-6 h-6 text-finance-savings" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolución Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={v => formatCurrency(v as number)} width={80} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="income" name="Ingresos" fill="#10b981" />
                <Bar dataKey="expense" name="Gastos" fill="#ef4444" />
                <Bar dataKey="savings" name="Ahorro" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseStats.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) =>
                    `${category}: ${(percentage as number).toFixed(1)}%`
                  }
                  outerRadius={80}
                  dataKey="amount"
                  nameKey="category"
                >
                  {expenseStats.slice(0, 5).map((_e, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
