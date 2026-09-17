export type CurrencyCode = 'RON' | 'EUR' | 'USD' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  nameRo: string;
  nameEn: string;
  position: 'prefix' | 'suffix';
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  RON: {
    code: 'RON',
    symbol: 'RON',
    nameRo: 'Leu Românesc (RON)',
    nameEn: 'Romanian Leu (RON)',
    position: 'suffix',
    flag: '🇷🇴',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    nameRo: 'Euro (€)',
    nameEn: 'Euro (€)',
    position: 'prefix',
    flag: '🇪🇺',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    nameRo: 'Dolar American ($)',
    nameEn: 'US Dollar ($)',
    position: 'prefix',
    flag: '🇺🇸',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    nameRo: 'Liră Britanică (£)',
    nameEn: 'British Pound (£)',
    position: 'prefix',
    flag: '🇬🇧',
  },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'RON';

const STORAGE_KEY = 'kaskaval_selected_currency';
const LEGACY_STORAGE_KEY = 'moneyfly_selected_currency';

export function getStoredCurrency(): CurrencyCode {
  try {
    const val = (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)) as CurrencyCode;
    if (val && CURRENCIES[val]) {
      return val;
    }
  } catch (e) {
    console.warn('LocalStorage error reading currency:', e);
  }
  return DEFAULT_CURRENCY;
}

export function setStoredCurrency(code: CurrencyCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch (e) {
    console.warn('LocalStorage error saving currency:', e);
  }
}

export function formatMoney(
  amount: number,
  currency: CurrencyCode = 'RON',
  options: { showSign?: boolean; signOnlyIfNegative?: boolean } = {}
): string {
  const config = CURRENCIES[currency] || CURRENCIES.RON;
  const absVal = Math.abs(amount).toLocaleString('ro-RO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  let signPrefix = '';
  if (options.showSign) {
    signPrefix = amount > 0 ? '+' : amount < 0 ? '-' : '';
  } else if (options.signOnlyIfNegative && amount < 0) {
    signPrefix = '-';
  }

  if (config.position === 'prefix') {
    return `${signPrefix}${config.symbol}${absVal}`;
  } else {
    return `${signPrefix}${absVal} ${config.symbol}`;
  }
}
