import { RationalNumber } from '../../../types/RationalNumber.ts';
import { math } from '../math.ts';

/**
 * Converts rational to string representation
 * @param {RationalNumber} rational
 * @return {string}
 */
export const rationalToValue = (rational: RationalNumber): string => {
  return math
    .evaluate(`${rational.numerator} / ${rational.denominator}`)
    .toFixed();
};
