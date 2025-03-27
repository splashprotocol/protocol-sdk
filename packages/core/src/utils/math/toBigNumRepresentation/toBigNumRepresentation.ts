import { formatOptions, math } from '../math.ts';

/**
 * Convert string representation of number count to bigint with specified decimals
 * @param {string | number} input
 * @param {number} decimals
 * @returns {bigint}
 */
export function toBigNumRepresentation(
  input: string | number,
  decimals?: number,
): bigint {
  const allowedInput = new RegExp(`^-?\\d+\\.?\\d{0,${decimals}}$`);
  const normalizedInput = typeof input === 'number' ? String(input) : input;

  if (!allowedInput.test(normalizedInput)) {
    throw new Error(`too many decimals. Expected ${decimals}`);
  }

  const toConvert = math.format(
    math.evaluate!(
      `${Number(input).toFixed(decimals || 0)} * 10^${decimals || 0}`,
    ),
    formatOptions,
  );
  return BigInt(toConvert);
}
