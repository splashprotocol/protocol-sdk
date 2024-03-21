import { SplashApi } from '../SplashApi.ts';

test('It should returns assets metadata dictionary', async () => {
  const metadata = await SplashApi.new('mainnet').getAssetsMetadata();

  expect(metadata).toBeInstanceOf(Object);
  expect(metadata['.']).toBeInstanceOf(Object);
  expect(metadata['.'].subject).toBe('');
  expect(metadata['.'].name).toBe('');
  expect(metadata['.'].ticker).toBe('ADA');
  expect(metadata['.'].decimals).toBe(6);
});
