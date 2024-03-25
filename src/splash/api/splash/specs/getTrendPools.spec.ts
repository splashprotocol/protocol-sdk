import { SplashApi } from '../SplashApi.ts';

test('It should returns valid raw trend pools', async () => {
  const trendPools = await SplashApi.new('mainnet').getTrendPools();

  expect(typeof trendPools[0].poolId).toBe('string');
  expect(typeof trendPools[0].x).toBe('string');
  expect(typeof trendPools[0].y).toBe('string');
  expect(typeof trendPools[0].tvlAda).toBe('number');
  expect(typeof trendPools[0].tvlUsd).toBe('number');
  expect(typeof trendPools[0].volumeAda).toBe('number');
  expect(typeof trendPools[0].volumeUsd).toBe('number');
  expect(typeof trendPools[0].apr).toBe('number');
  expect(typeof trendPools[0].aprTrend).toBe('number');
  expect(trendPools.length).toBe(5);
});
