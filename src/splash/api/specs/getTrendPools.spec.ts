import { ada } from '../../../core/models/assetInfo/ada.ts';
import { AssetInfo } from '../../../core/models/assetInfo/AssetInfo.ts';
import { usd } from '../../../core/models/assetInfo/usd.ts';
import { Currency } from '../../../core/models/currency/Currency.ts';
import { Splash } from '../../splash.ts';
import { SplashApi } from '../splash/SplashApi.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet', {
  includesMetadata: true,
});
test('It returns top 5 trading pool', async () => {
  const trendPools = await splash.api.getTrendPools();

  expect(trendPools[0].x).toBeInstanceOf(AssetInfo);
  expect(trendPools[0].y).toBeInstanceOf(AssetInfo);
  expect(trendPools[0].tvlAda).toBeInstanceOf(Currency);
  expect(trendPools[0].tvlAda.asset.splashId).toBe(ada.splashId);
  expect(trendPools[0].tvlUsd).toBeInstanceOf(Currency);
  expect(trendPools[0].tvlUsd.asset.splashId).toBe(usd.splashId);
  expect(trendPools[0].volumeAda).toBeInstanceOf(Currency);
  expect(trendPools[0].volumeAda.asset.splashId).toBe(ada.splashId);
  expect(trendPools[0].volumeUsd).toBeInstanceOf(Currency);
  expect(trendPools[0].volumeUsd.asset.splashId).toBe(usd.splashId);
});
