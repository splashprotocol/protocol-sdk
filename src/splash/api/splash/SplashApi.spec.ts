import { SplashApi } from './SplashApi.ts';

test('it should returns valid raw splash liquidity pools list', async () => {
  const pools = await SplashApi.new('mainnet').getSplashPools();

  expect(pools.every((p) => typeof p.pool.id === 'string')).toBe(true);
});
