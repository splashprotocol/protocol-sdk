import { SplashApi } from '../SplashApi.ts';

test('It should return valid pairs array', async () => {
  const pairs = await SplashApi.new('mainnet').getPairs();

  expect(typeof pairs[0].base).toBe('string');
  expect(typeof pairs[0].quote).toBe('string');
  expect(typeof pairs[0].change).toBe('number');
  expect(typeof pairs[0].lastSpot).toBe('number');
  expect(typeof pairs[0].baseAdaRate).toBe('number');
  expect(typeof pairs[0].quoteAdaRate).toBe('number');
});
