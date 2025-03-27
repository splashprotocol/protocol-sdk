import { formatOptions, math } from '../math.ts';

/**
 * Convert bigint to string representation of number with specified decimals count
 * @param {bigint | number | string} bigNum
 * @param {number} decimals
 * @returns {string}
 */
export function toNumberRepresentation(
  bigNum: bigint | number | string,
  decimals?: number,
): string {
  return math.format(
    math.evaluate(`${bigNum} / 10^${decimals || 0}`),
    formatOptions,
  );
}
