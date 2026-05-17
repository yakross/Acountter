import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { capacitorStorage } from '@/utils/capacitorStorage';

export interface CurrencyOption {
  code: string;
  label: string;
  locale: string;
  symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'COP', label: 'Peso colombiano', locale: 'es-CO', symbol: '$' },
  { code: 'USD', label: 'Dólar estadounidense', locale: 'en-US', symbol: '$' },
  { code: 'MXN', label: 'Peso mexicano', locale: 'es-MX', symbol: '$' },
  { code: 'ARS', label: 'Peso argentino', locale: 'es-AR', symbol: '$' },
  { code: 'PEN', label: 'Sol peruano', locale: 'es-PE', symbol: 'S/' },
  { code: 'CLP', label: 'Peso chileno', locale: 'es-CL', symbol: '$' },
  { code: 'EUR', label: 'Euro', locale: 'es-ES', symbol: '€' },
  { code: 'BRL', label: 'Real brasileño', locale: 'pt-BR', symbol: 'R$' },
];

interface CurrencyCtx {
  currency: CurrencyOption;
  setCurrency: (code: string) => void;
  format: (value: number) => string;
}

const CurrencyContext = createContext<CurrencyCtx | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyOption>(CURRENCIES[0]);

  useEffect(() => {
    capacitorStorage.getCurrency().then(code => {
      const found = CURRENCIES.find(c => c.code === code);
      if (found) setCurrencyState(found);
    });
  }, []);

  const setCurrency = useCallback((code: string) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (!found) return;
    setCurrencyState(found);
    capacitorStorage.saveCurrency(code);
  }, []);

  const format = useCallback(
    (value: number) =>
      value.toLocaleString(currency.locale, {
        style: 'currency',
        currency: currency.code,
        maximumFractionDigits: currency.code === 'COP' || currency.code === 'CLP' ? 0 : 2,
      }),
    [currency],
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be inside CurrencyProvider');
  return ctx;
}
