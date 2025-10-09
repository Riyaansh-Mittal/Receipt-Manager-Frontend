import { CURRENCIES, DEFAULT_CURRENCY } from '../constants/receipt.constants';

/**
 * Format amount with currency symbol
 * Handles null/undefined values gracefully
 */
export const formatCurrency = (amount, currencyCode = DEFAULT_CURRENCY) => {
  // Handle null/undefined/invalid amounts
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A';
  }

  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  
  if (!currency) {
    return `${Number(amount).toFixed(2)}`;
  }

  const formatted = Number(amount).toFixed(2);
  return `${currency.symbol}${formatted}`;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString) => {
  if (typeof currencyString === 'number') {
    return currencyString;
  }

  if (!currencyString) {
    return 0;
  }

  // Remove currency symbols and parse
  const cleaned = String(currencyString).replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
  if (!currencyCode) return '$';
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.symbol || currencyCode;
};

/**
 * Get currency name
 */
export const getCurrencyName = (currencyCode) => {
  if (!currencyCode) return 'US Dollar';
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.name || currencyCode;
};

/**
 * Validate currency code
 */
export const isValidCurrency = (currencyCode) => {
  if (!currencyCode) return false;
  return CURRENCIES.some((c) => c.code === currencyCode);
};

/**
 * Format amount for input (without symbol)
 * Handles null/undefined values
 */
export const formatAmountForInput = (amount) => {
  if (!amount && amount !== 0) return '';
  return Number(amount).toFixed(2);
};

/**
 * Validate amount
 */
export const validateAmount = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return 'Invalid amount';
  }
  
  if (num < 0.01) {
    return 'Amount must be at least 0.01';
  }
  
  if (num > 999999.99) {
    return 'Amount cannot exceed 999,999.99';
  }
  
  return null;
};
