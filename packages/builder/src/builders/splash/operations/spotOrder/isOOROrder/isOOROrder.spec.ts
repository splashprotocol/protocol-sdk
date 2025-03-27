import { SplashApi } from '@splashprotocol/api';
import { SplashBuilder } from '../../../SplashBuilder.ts';
import { SplashExplorer } from '../../../../../explorers/splash/SplashExplorer.ts';
import { isOOROrder } from './isOOROrder.ts';

test('it should returns true for ask order', async () => {
  const explorer = SplashExplorer.new('mainnet');
  const api = SplashApi({ network: 'mainnet' });
  const builder = SplashBuilder(api, explorer);

  expect(
    await isOOROrder(
      'cd4b1ff321ec67bb497fe80be6acc3903908436f3113a9018a2f8eb622b0c7ab:0',
      builder,
    ),
  ).toBe(true);
});

test('it should returns false for ask order', async () => {
  const explorer = SplashExplorer.new('mainnet');
  const api = SplashApi({ network: 'mainnet' });
  const builder = SplashBuilder(api, explorer);

  expect(
    await isOOROrder(
      '28be98200ced7851611d1e5bdc26d1f2f5dd5465f81a35490f7bef67f007da53:0',
      builder,
    ),
  ).toBe(false);
});

test('it should returns true for bid order', async () => {
  const explorer = SplashExplorer.new('mainnet');
  const api = SplashApi({ network: 'mainnet' });
  const builder = SplashBuilder(api, explorer);

  expect(
    await isOOROrder(
      '8e340757e45bc0005f9b92a8a066e4e543a00d94aefbb6cfebdbadb8d9b9308f:0',
      builder,
    ),
  ).toBe(true);
});

test('it should returns true for false order', async () => {
  const explorer = SplashExplorer.new('mainnet');
  const api = SplashApi({ network: 'mainnet' });
  const builder = SplashBuilder(api, explorer);

  expect(
    await isOOROrder(
      '5aa642cc8365182437494b3478473fc02bb80e64250db72f64ff183aaa905927:0',
      builder,
    ),
  ).toBe(false);
});
