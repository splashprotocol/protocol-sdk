import { all, ConfigOptions, create, FormatOptions } from 'mathjs';

const mathConf: ConfigOptions = {
  epsilon: 1e-24,
  matrix: 'Matrix',
  number: 'BigNumber',
  precision: 64,
};

const formatOptions: FormatOptions = {
  notation: 'fixed',
  lowerExp: 1e-100,
  upperExp: 1e100,
};

export const math = create(all, mathConf);

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
    math.evaluate!(`${input} * 10^${decimals || 0}`),
    formatOptions,
  );
  console.log(toConvert);
  return BigInt(toConvert);
}

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
