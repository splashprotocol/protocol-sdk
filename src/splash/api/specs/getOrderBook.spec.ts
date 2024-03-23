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
  expect(orderBook.base.splashId).toBe(spf.splashId);
  expect(orderBook.quote.splashId).toBe(ada.splashId);
  expect(orderBook.ammTotalLiquidityQuote).toBeInstanceOf(Currency);
  expect(orderBook.ammTotalLiquidityQuote.asset.splashId).toBe(ada.splashId);
  expect(orderBook.ammTotalLiquidityBase).toBeInstanceOf(Currency);
  expect(orderBook.ammTotalLiquidityBase.asset.splashId).toBe(spf.splashId);

  expect(orderBook.asks[0].price).toBeInstanceOf(Price);
  expect(orderBook.asks[0].accumulatedAveragePrice).toBeInstanceOf(Price);
  expect(orderBook.asks[1].price).toBeInstanceOf(Price);
  expect(orderBook.asks[1].accumulatedAveragePrice).toBeInstanceOf(Price);

  expect(orderBook.asks[0].price.raw).toBeLessThan(orderBook.asks[1].price.raw);
  expect(orderBook.asks[0].accumulatedAveragePrice.raw).toBeLessThan(
    orderBook.asks[1].accumulatedAveragePrice.raw,
  );
  expect(orderBook.asks[0].accumulatedAmount.amount).toBeLessThan(
    orderBook.asks[1].accumulatedAmount.amount,
  );

  expect(orderBook.bids[1].price.raw).toBeLessThan(orderBook.bids[0].price.raw);
  expect(orderBook.bids[1].accumulatedAveragePrice.raw).toBeLessThan(
    orderBook.bids[0].accumulatedAveragePrice.raw,
  );
  expect(orderBook.bids[0].accumulatedAmount.amount).toBeLessThan(
    orderBook.bids[1].accumulatedAmount.amount,
  );
});
