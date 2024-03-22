import { ada } from '../../../core/models/assetInfo/ada.ts';
import { spf } from '../../../core/models/assetInfo/spf.ts';
import { Currency } from '../../../core/models/currency/Currency.ts';
import { Price } from '../../../core/models/price/Price.ts';
import { Splash } from '../../splash.ts';
import { SplashApi } from '../splash/SplashApi.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet', {
  includesMetadata: true,
});

test('it should return valid order book', async () => {
  const orderBook = await splash.api.getOrderBook({
    base: spf,
    quote: ada,
  });

  expect(orderBook.spotPrice).toBeInstanceOf(Price);
  expect(orderBook.spotPrice.base.splashId).toBe(spf.splashId);
  expect(orderBook.spotPrice.quote.splashId).toBe(ada.splashId);
  expect(orderBook.pair.base.splashId).toBe(spf.splashId);
  expect(orderBook.pair.quote.splashId).toBe(ada.splashId);
  expect(orderBook.ammTotalLiquidityQuote).toBeInstanceOf(Currency);
  expect(orderBook.ammTotalLiquidityQuote.asset.splashId).toBe(ada.splashId);
  expect(orderBook.ammTotalLiquidityBase).toBeInstanceOf(Currency);
  expect(orderBook.ammTotalLiquidityBase.asset.splashId).toBe(spf.splashId);
});
