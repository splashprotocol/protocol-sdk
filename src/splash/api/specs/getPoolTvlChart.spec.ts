import { AssetInfo } from '../../../core/models/assetInfo/AssetInfo.ts';
import { Splash } from '../../splash.ts';
import { SplashApi } from '../splash/SplashApi.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet', {
  includesMetadata: true,
});

test('It should returns valid tvl chart by pool', async () => {
  const pooltvlChart = await splash.api.getPoolTvlChart({
    interval: 'd30',
    poolId:
      'cab2059b754430ae6e09a547f94d61de11901573f1d2388de95cbb0c.48554e545f4144415f4e4654',
  });

  expect(pooltvlChart.asset).toBeInstanceOf(AssetInfo);
  expect(pooltvlChart.asset.splashId).toBe(AssetInfo.ada.splashId);
  expect(pooltvlChart.data.length).toBe(31);
});
