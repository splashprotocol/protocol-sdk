import { ada } from '../../../../core/models/assetInfo/ada.ts';
import { spf } from '../../../../core/models/assetInfo/spf.ts';
import { SplashApi } from '../SplashApi.ts';

test('It should returns valid instance raw order book', async () => {
  const orderBook = await SplashApi.new('premainnet2').getOrderBook({
    base: spf,
    quote: ada,
  });

  expect(typeof orderBook.spot).toBe('number');

  expect(typeof orderBook.asks[0].price).toBe('string');
  expect(typeof orderBook.asks[0].volumeRelation).toBe('number');
  expect(typeof orderBook.asks[0].ordersLiquidity).toBe('string');
  expect(typeof orderBook.asks[0].poolsLiquidity).toBe('string');
  expect(typeof orderBook.asks[0].accumulatedLiquidity).toBe('string');

  expect(typeof orderBook.bids[0].price).toBe('string');
  expect(typeof orderBook.bids[0].volumeRelation).toBe('number');
  expect(typeof orderBook.bids[0].ordersLiquidity).toBe('string');
  expect(typeof orderBook.bids[0].poolsLiquidity).toBe('string');
  expect(typeof orderBook.bids[0].accumulatedLiquidity).toBe('string');

  expect(typeof orderBook.ammTotalLiquidityBase).toBe('string');
  expect(typeof orderBook.ammTotalLiquidityQuote).toBe('string');
});
