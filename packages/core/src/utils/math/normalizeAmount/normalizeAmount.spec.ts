import { normalizeAmount } from './normalizeAmount.ts';

test('it should returns normalized amount ', () => {
  expect(normalizeAmount('0.00145', 3)).toBe('0.001');
  expect(normalizeAmount('0.01', 3)).toBe('0.01');
});
