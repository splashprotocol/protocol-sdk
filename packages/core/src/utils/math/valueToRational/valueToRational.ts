import { RationalNumber } from '../../../types/RationalNumber.ts';
import { formatOptions, math } from '../math.ts';

/**
 * Converts number or string to rational representation
 * @param {number | string} value
 * @return {RationalNumber}
 */
export const valueToRational = (value: number | string): RationalNumber => {
  const fmtN =
    typeof value === 'string'
      ? //   TODO: FIX
        math.format(Number(value), formatOptions)
      : math.format(Number(value), formatOptions);
  const [whole, rawDecimals = ''] = String(fmtN).split('.');
  const numDecimals = Math.min(rawDecimals.length, 20);
  const decimals =
    rawDecimals.length > numDecimals
      ? rawDecimals.slice(0, numDecimals)
      : rawDecimals;
  const denominator = BigInt(math.evaluate(`10^${numDecimals}`));
  const numerator = BigInt(whole) * denominator + BigInt(decimals);

  return {
    numerator,
    denominator,
  };
};
