import { toBigNumRepresentation } from '../toBigNumRepresentation/toBigNumRepresentation.ts';

test('it should returns valid bigint representation of string with fractions', () => {
  const number = '123.123';
  expect(toBigNumRepresentation(number, 3)).toBe(123123n);
  expect(toBigNumRepresentation(number, 5)).toBe(12312300n);
});
