import { useCurrency, CURRENCIES } from '@/contexts/CurrencyContext';
import { DollarSign } from 'lucide-react';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-50 rounded-lg">
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Moneda</p>
          <p className="text-sm text-gray-500">Cambia la divisa de toda la app</p>
        </div>
      </div>

      <select
        value={currency.code}
        onChange={e => setCurrency(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500 outline-none"
      >
        {CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>
            {c.code} — {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
