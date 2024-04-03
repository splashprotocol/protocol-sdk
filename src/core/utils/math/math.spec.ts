import {
  getDecimalsCount,
  normalizeAmount,
  numberToRational,
  rationalToNumber,
  toBigNumRepresentation,
  toNumberRepresentation,
} from './math.ts';

test('it should returns valid string representation of bigint without fractions', () => {
  const bigint = 4000000n;

  expect(toNumberRepresentation(bigint)).toBe('4000000');
  expect(toNumberRepresentation(bigint, 3)).toBe('4000');
  expect(toNumberRepresentation(bigint, 6)).toBe('4');
});

test('it should returns valid string representation of bigint with fractions', () => {
  const bigint = 4000123n;

  expect(toNumberRepresentation(bigint)).toBe('4000123');
  expect(toNumberRepresentation(bigint, 3)).toBe('4000.123');
  expect(toNumberRepresentation(bigint, 6)).toBe('4.000123');
});

test('it should returns string representation decimals count', () => {
  expect(getDecimalsCount('0.001')).toBe(3);
  expect(getDecimalsCount('0.00145')).toBe(5);
  expect(getDecimalsCount('0.01')).toBe(2);
});

test('it should returns normalized amount ', () => {
  expect(normalizeAmount('0.00145', 3)).toBe('0.001');
  expect(normalizeAmount('0.01', 3)).toBe('0.01');
});

test('it should returns valid bigint representation of string with fractions', () => {
  const number = '123.123';
  expect(toBigNumRepresentation(number, 3)).toBe(123123n);
  expect(toBigNumRepresentation(number, 5)).toBe(12312300n);
});

test('it should convert number to valid rational representation', () => {
  const number = '123.1234';
  const rational = numberToRational(number);

  expect(rational.numerator).toBe(1231234n);
  expect(rational.denominator).toBe(10000n);
});

test('it should convert rational to valid number representation', () => {
  const number = 123.1234;
  const rational = numberToRational(number);

  expect(rationalToNumber(rational)).toBe(number);
});
