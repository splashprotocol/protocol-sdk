import { timestampValidator } from './timestampValidator.ts';

test('it should pass timestamp', () => {
  expect(timestampValidator(Date.now())).toBe(true);
});

test('it should throw error for greater timestamp', () => {
  try {
    timestampValidator(Date.now() + 10_000);
  } catch (err: unknown) {
    expect(err).toBeInstanceOf(Error);
  }
});

test('it should throw error for low timestamp', () => {
  try {
    timestampValidator(Date.now() - 10_000);
  } catch (err: unknown) {
    expect(err).toBeInstanceOf(Error);
  }
});
