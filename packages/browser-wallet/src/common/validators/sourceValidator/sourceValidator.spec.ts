import { sourceValidator } from './sourceValidator.ts';

test('it should pass source check', () => {
  expect(sourceValidator(global as any, global as any)).toBe(true);
});

test('it should throws error', () => {
  try {
    sourceValidator(global as any, {} as any);
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(Error);
  }
});
