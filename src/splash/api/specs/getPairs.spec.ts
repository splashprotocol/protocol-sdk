import { ada } from '../../../core/models/assetInfo/ada.ts';
import { AssetInfo } from '../../../core/models/assetInfo/AssetInfo.ts';
import { Price } from '../../../core/models/price/Price.ts';
import { Splash } from '../../splash.ts';
import { SplashApi } from '../splash/SplashApi.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet', {
  includesMetadata: true,
});

test('it should returns valid pair array', async () => {
  const pairs = await splash.api.getPairs();

  expect(
    pairs.every((p) => {
      return (
        p.base instanceof AssetInfo &&
        p.quote instanceof AssetInfo &&
        typeof p.change === 'number' &&
        p.quoteAdaPrice instanceof Price &&
        p.quoteAdaPrice.quote.splashId === ada.splashId &&
        p.baseAdaPrice instanceof Price &&
        p.baseAdaPrice.quote.splashId === ada.splashId &&
        p.spotPrice.base.splashId === p.base.splashId &&
        p.spotPrice.quote.splashId === p.quote.splashId
      );
    }),
  ).toBe(true);
});
