import { SplashApi } from '../../../splash/api/splash/SplashApi.ts';
import { Splash } from '../../../splash/splash.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { Currency } from '../currency/Currency.ts';
import { Price } from '../price/Price.ts';
import { TradeOperation, TradeOperationStatus } from './TradeOperation.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet');

test('It should creates valid trade operation', () => {
  const tradeOperation = TradeOperation.new(
    {
      base: Currency.ada(1000n),
      currentQuote: Currency.spf(1000n),
      price: Price.new({
        base: AssetInfo.ada,
        quote: AssetInfo.spf,
        raw: 0.2,
      }),
      status: TradeOperationStatus.Pending,
      orderTimestamp: Date.now(),
      orderId: '',
      filled: 0,
    },
    splash,
  );

  expect(tradeOperation).toBeInstanceOf(TradeOperation);
});
