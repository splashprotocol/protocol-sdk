import { getDecimalsCount } from './getDecimalsCount.ts';

test('it should returns string representation decimals count', () => {
  expect(getDecimalsCount('0.001')).toBe(3);
  expect(getDecimalsCount('0.00145')).toBe(5);
  expect(getDecimalsCount('0.01')).toBe(2);
});
