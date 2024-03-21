import { SplashApi } from '../SplashApi.ts';

test('It should returns asset metadata', async () => {
  const metadata = await SplashApi.new('mainnet').getAssetMetadata('.');

  expect(metadata).toBeInstanceOf(Object);
  expect(metadata.subject).toBe('');
  expect(metadata.name).toBe('');
  expect(metadata.ticker).toBe('ADA');
  expect(metadata.decimals).toBe(6);
});
