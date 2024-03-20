import { ada } from '../../../core/models/assetInfo/ada.ts';
import { usd } from '../../../core/models/assetInfo/usd.ts';
import { Currency } from '../../../core/models/currency/Currency.ts';
import { Splash } from '../../splash.ts';
import { SplashApi } from '../splash/SplashApi.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet', {
  includesMetadata: true,
});

test('it should returns valid raw protocol stats', async () => {
  const protocolStats = await splash.api.getProtocolStats();

  expect(protocolStats.lpFeeUsd).toBeInstanceOf(Currency);
  expect(protocolStats.lpFeeUsd.asset).toEqual(usd);
  expect(protocolStats.volumeUsd).toBeInstanceOf(Currency);
  expect(protocolStats.volumeUsd.asset).toEqual(usd);
  expect(protocolStats.tvlUsd).toBeInstanceOf(Currency);
  expect(protocolStats.tvlUsd.asset).toEqual(usd);

  expect(protocolStats.lpFeesAda).toBeInstanceOf(Currency);
  expect(protocolStats.lpFeesAda.asset).toEqual(ada);
  expect(protocolStats.volumeAda).toBeInstanceOf(Currency);
  expect(protocolStats.volumeAda.asset).toEqual(ada);
  expect(protocolStats.tvlAda).toBeInstanceOf(Currency);
  expect(protocolStats.tvlAda.asset).toEqual(ada);
});
