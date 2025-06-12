import { nonceValidator } from './nonceValidator.ts';

test('it should pass nonce', () => {
  expect(nonceValidator('test')).toBe(true);
});

test('it should throw error', () => {
  try {
    expect(nonceValidator('test'));
  } catch (err: unknown) {
    expect(err).toBeInstanceOf(Error);
  }
});
