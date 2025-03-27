import { CurrencyConverter } from './CurrencyConverter.ts';
import { Price } from '../../../models/price/Price.ts';
import { AssetInfo } from '../../../models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../models/currency/Currency.ts';

test('It should create valid instance of CurrencyConverter', () => {
  const currencyConverter = CurrencyConverter.new({
    prices: [
      Price.new({
        base: AssetInfo.spf,
        quote: AssetInfo.ada,
        value: '0.02',
      }),
    ],
    adaUsdPrice: Price.new({
      base: AssetInfo.ada,
      quote: AssetInfo.usd,
      value: '0.7',
    }),
  });

  expect(currencyConverter).toBeInstanceOf(CurrencyConverter);
  expect(currencyConverter.getPrice(AssetInfo.spf)).toBeInstanceOf(Price);
  expect(currencyConverter.getPrice(AssetInfo.spf).raw).toBe('0.02');
  expect(currencyConverter.getPrice(AssetInfo.spf, 'usd').raw).toBe('0.014');
  expect(currencyConverter.getPrice(AssetInfo.splash).raw).toBe('0');

  expect(currencyConverter.convert(Currency.spf(100n))).toBeInstanceOf(
    Currency,
  );
  expect(currencyConverter.convert(Currency.spf(100n)).toString()).toBe(
    '0.000002',
  );
  expect(currencyConverter.convert(Currency.spf(100n), 'usd').toString()).toBe(
    '0.01',
  );
});
