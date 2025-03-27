import { getDecimalsCount } from '../getDecimalsCount/getDecimalsCount.ts';

/**
 * Cuts redundant fractions
 * @param {string} amount
 * @param {number} expectedDecimals
 * @returns {string}
 */
export const normalizeAmount = (
  amount: string,
  expectedDecimals?: number,
): string => {
  const currentDecimalsCount = getDecimalsCount(amount);

  if (currentDecimalsCount <= (expectedDecimals || 0)) {
    return amount;
  }

  return amount.slice(
    0,
    amount.length - currentDecimalsCount + (expectedDecimals || 0),
  );
};
