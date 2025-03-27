import { toNumberRepresentation } from '../toNumberRepresentation/toNumberRepresentation.ts';

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
