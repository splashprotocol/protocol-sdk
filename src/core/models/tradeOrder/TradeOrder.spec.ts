import { SplashApi } from '../../../splash/api/splash/SplashApi.ts';
import { Splash } from '../../../splash/splash.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { Currency } from '../currency/Currency.ts';
import { Price } from '../price/Price.ts';
import { TradeOrder } from './TradeOrder.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet');

test('It should creates valid trade operation', () => {
  const tradeOperation = TradeOrder.new(
    {
      orderId: '',
      lastTransactionId: '',
      latestPendingOrderId: '',
      input: Currency.ada(1000n),
      currentOutput: Currency.spf(1000n),
      price: Price.new({
        base: AssetInfo.ada,
        quote: AssetInfo.spf,
        raw: '0.2',
      }),
      status: 'mempool',
      orderTimestamp: Date.now(),
      orderTransactionId: '',
      filled: 0,
    },
    splash,
  );

  expect(tradeOperation).toBeInstanceOf(TradeOrder);
});
