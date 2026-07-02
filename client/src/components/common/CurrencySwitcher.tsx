import { useEffect, useRef, useState } from 'react';
import { CURRENCIES, CURRENCY_META, useCurrency } from '../../context/CurrencyContext';
import type { Currency } from '../../context/CurrencyContext';

interface CurrencySwitcherProps {
  className?: string;
}

const CurrencySwitcher = ({ className = '' }: CurrencySwitcherProps) => {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleSelect = (next: Currency) => {
    setOpen(false);
    setCurrency(next);
  };

  const current = CURRENCY_META[currency];

  return (
    <div
      ref={containerRef}
      className={`lang-switcher ${className}`.trim()}
      aria-label="Currency"
    >
      <button
        type="button"
        className="lang-switcher__trigger"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lang-switcher__flag" aria-hidden="true">{current.flag}</span>
        <span className="lang-switcher__current">{currency}</span>
        <span className={`lang-switcher__chevron ${open ? 'is-open' : ''}`} aria-hidden="true">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <ul className="lang-switcher__menu" role="listbox" aria-label="Select currency">
          {CURRENCIES.map(c => {
            const meta = CURRENCY_META[c];
            return (
              <li
                key={c}
                role="option"
                aria-selected={currency === c}
                className={`lang-switcher__option ${currency === c ? 'is-active' : ''}`}
                onClick={() => handleSelect(c)}
              >
                <span className="lang-switcher__option-flag" aria-hidden="true">{meta.flag}</span>
                <span className="lang-switcher__option-label">{meta.label}</span>
                <span className="lang-switcher__option-code">{meta.symbol}</span>
                {currency === c && (
                  <span className="lang-switcher__check" aria-hidden="true">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CurrencySwitcher;
