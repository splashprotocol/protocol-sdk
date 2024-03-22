import { ada } from '../../../../core/models/assetInfo/ada.ts';
import { spf } from '../../../../core/models/assetInfo/spf.ts';
import { SplashApi } from '../SplashApi.ts';

test('It should returns valid instance raw order book', async () => {
  const orderBook = await SplashApi.new('mainnet').getOrderBook({
    base: spf,
    quote: ada,
  });

  expect(orderBook.pair.base).toBe(spf.splashId);
  expect(orderBook.pair.quote).toBe(ada.splashId);
  expect(typeof orderBook.spot).toBe('number');

  expect(typeof orderBook.asksOrderBook[0].spot).toBe('number');
  expect(typeof orderBook.asksOrderBook[0].ammVolumeRelation).toBe('number');
  expect(typeof orderBook.asksOrderBook[0].ordersVolumeRelation).toBe('number');
  expect(typeof orderBook.asksOrderBook[0].accumulatedVolumeRelation).toBe(
    'number',
  );
  expect(typeof orderBook.asksOrderBook[0].ordersVolume).toBe('string');
  expect(typeof orderBook.asksOrderBook[0].poolsVolume).toBe('string');
  expect(typeof orderBook.asksOrderBook[0].accumulatedVolume).toBe('string');

  expect(typeof orderBook.bidsOrderBook[0].spot).toBe('number');
  expect(typeof orderBook.bidsOrderBook[0].ammVolumeRelation).toBe('number');
  expect(typeof orderBook.bidsOrderBook[0].ordersVolumeRelation).toBe('number');
  expect(typeof orderBook.bidsOrderBook[0].accumulatedVolumeRelation).toBe(
    'number',
  );
  expect(typeof orderBook.bidsOrderBook[0].ordersVolume).toBe('string');
  expect(typeof orderBook.bidsOrderBook[0].poolsVolume).toBe('string');
  expect(typeof orderBook.bidsOrderBook[0].accumulatedVolume).toBe('string');

  expect(typeof orderBook.ammTotalLiquidityBase).toBe('string');
  expect(typeof orderBook.ammTotalLiquidityQuote).toBe('string');
});
