import { Splash } from '../splash.ts';
import { SplashApi } from './splash/SplashApi.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet', {
  includesMetadata: true,
});
test('it should returns pools collection', async () => {
  const pools = await splash.api.getSplashPools();

  expect(pools.every((p) => typeof p.id === 'string')).toBe(true);
});
