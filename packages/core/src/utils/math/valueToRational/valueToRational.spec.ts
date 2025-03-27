import { valueToRational } from './valueToRational.ts';

test('it should convert number to valid rational representation', () => {
  const number = '123.12340000000000000001';
  const rational = valueToRational(number);

  expect(rational.numerator).toBe(12312340000000000000001n);
  expect(rational.denominator).toBe(100000000000000000000n);
});
