import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type Currency = 'EGP' | 'USD' | 'SAR' | 'EUR';

export const CURRENCY_META: Record<Currency, { flag: string; symbol: string; label: string }> = {
  EGP: { flag: '🇪🇬', symbol: 'E£',   label: 'Egyptian Pound' },
  USD: { flag: '🇺🇸', symbol: '$',    label: 'US Dollar'      },
  SAR: { flag: '🇸🇦', symbol: 'ر.س', label: 'Saudi Riyal'    },
  EUR: { flag: '🇪🇺', symbol: '€',    label: 'Euro'           },
};

export const CURRENCIES: Currency[] = ['EGP', 'USD', 'SAR', 'EUR'];

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'USD',
  setCurrency: () => {},
  symbol: '$',
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();

  const [currency, setCurrencyRaw] = useState<Currency>(() => {
    const lang = localStorage.getItem('language') ?? 'en';
    return lang === 'ar' ? 'SAR' : 'USD';
  });

  // Track whether this is the first mount to avoid double-setting on init
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    // Language switch always overrides currency
    const next: Currency = i18n.language === 'ar' ? 'SAR' : 'USD';
    setCurrencyRaw(next);
    localStorage.setItem('currency', next);
  }, [i18n.language]);

  const setCurrency = (c: Currency) => {
    setCurrencyRaw(c);
    localStorage.setItem('currency', c);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol: CURRENCY_META[currency].symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};
