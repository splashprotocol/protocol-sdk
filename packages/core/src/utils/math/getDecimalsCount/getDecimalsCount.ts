/**
 * Returns decimals count of amount string representation
 * @param {string} amount
 * @returns {number}
 */
export const getDecimalsCount = (amount: string): number => {
  const decimals = amount.split('.')[1];

  if (decimals) {
    return decimals.length;
  }
  return 0;
};
