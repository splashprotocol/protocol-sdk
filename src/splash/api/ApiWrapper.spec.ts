import { Splash } from '../splash.ts';
import { SplashApi } from './splash/SplashApi.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet', {
  includesMetadata: true,
});

// test('it should returns metadata by asset id', async () => {
//   const metadata = await splash.api.getMetadata(spf.splashId);
//
//   expect(metadata?.ticker).toBe('SPF');
//   expect(metadata?.description).toBe(
//     'SPF serves as the utility token for Layer 1 chains and native currency for the Spectrum Network, which is a decentralized smart-contract platform designed for developing natively cross-chain applications.',
//   );
//   expect(metadata?.decimals).toBe(6);
// });

test('it should returns pools collection', async () => {
  const pools = await splash.api.getSplashPools();
  console.log(pools);
  expect(pools).toBeInstanceOf(Array);
});
