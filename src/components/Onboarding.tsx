import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CurrencySelector } from '@/contexts/CurrencySelector';
import { Input } from '@/components/ui/Input';
import { useTransactions } from '@/hooks/useTransactions';
import { useSavings } from '@/hooks/useSavings';
import { Sparkles, ArrowRight, DollarSign, Target, CheckCircle2 } from 'lucide-react';

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const { addTransaction } = useTransactions();
  const { addGoal } = useSavings();

  // Step 2: First Income
  const [incomeAmount, setIncomeAmount] = useState('');
  
  // Step 3: First Goal
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');

  const handleNext = () => {
    if (step === 2 && incomeAmount) {
      addTransaction({
        amount: parseFloat(incomeAmount),
        type: 'income',
        category: 'Salario',
        date: new Date().toISOString().split('T')[0],
        description: 'Saldo inicial / Salario'
      });
    }

    if (step === 3) {
      if (goalName && goalAmount) {
        addGoal({
          name: goalName,
          targetAmount: parseFloat(goalAmount),
          deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
          category: 'other'
        });
      }
      onComplete();
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <CardTitle className="text-2xl">¡Bienvenido a FinanceAI!</CardTitle>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Configuremos tu cuenta en 3 sencillos pasos
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 text-primary-600 font-medium mb-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">1</div>
                <span>Selecciona tu Moneda</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Elige la moneda principal con la que registrarás tus ingresos y gastos.
              </p>
              <CurrencySelector />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 text-primary-600 font-medium mb-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">2</div>
                <span>Tu Primer Ingreso</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Agrega tu saldo actual o tu último salario para empezar con fondos.
              </p>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-10"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 text-primary-600 font-medium mb-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">3</div>
                <span>Tu Primera Meta</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Definir metas ayuda a ahorrar más. ¿Qué te gustaría lograr?
              </p>
              <div className="space-y-3">
                <Input
                  placeholder="Ej: Fondo de emergencia, Viaje..."
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
                <div className="relative">
                  <Target className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="Monto objetivo (Ej: 1000)"
                    className="pl-10"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 flex justify-between items-center">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-2 w-8 rounded-full ${i <= step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              ))}
            </div>
            <Button onClick={handleNext} className="flex items-center gap-2">
              {step === 3 ? (
                <>Comenzar <CheckCircle2 className="w-4 h-4" /></>
              ) : (
                <>Siguiente <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
