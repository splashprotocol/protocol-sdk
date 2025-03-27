import { rationalToValue } from './rationalToValue.ts';
import { RationalNumber } from '../../../types/RationalNumber.ts';

test('it should convert rational to valid number representation', () => {
  const number = '123.12340000000000000001';
  const rational: RationalNumber = {
    numerator: 12312340000000000000001n,
    denominator: 100000000000000000000n,
  };

  expect(rationalToValue(rational)).toBe(number);
});
