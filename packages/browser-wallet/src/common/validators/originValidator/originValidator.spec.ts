import { originValidator } from './originValidator.ts';

test('it should pass origin', () => {
  expect(originValidator(['localhost:3000'], 'localhost:3000')).toBe(true);
});

test('it should throws error', () => {
  try {
    originValidator(['localhost:3000'], 'localhost:3001');
  } catch (error: unknown) {
    expect(error).toBeInstanceOf(Error);
  }
});
