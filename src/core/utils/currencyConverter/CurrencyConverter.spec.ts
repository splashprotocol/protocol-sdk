import { ada } from '../../models/assetInfo/ada.ts';
import { AssetInfo } from '../../models/assetInfo/AssetInfo.ts';
import { spf } from '../../models/assetInfo/spf.ts';
import { usd } from '../../models/assetInfo/usd.ts';
import { Currency } from '../../models/currency/Currency.ts';
import { Price } from '../../models/price/Price.ts';
import { CurrencyConverter } from './CurrencyConverter.ts';

test('It should create valid instance of CurrencyConverter', () => {
  const currencyConverter = CurrencyConverter.new({
    prices: [
      Price.new({
        base: spf,
        quote: ada,
        raw: '0.02',
      }),
    ],
    adaUsdPrice: Price.new({
      base: ada,
      quote: usd,
      raw: '0.7',
    }),
  });

  expect(currencyConverter).toBeInstanceOf(CurrencyConverter);
  expect(currencyConverter.getPrice(spf)).toBeInstanceOf(Price);
  expect(currencyConverter.getPrice(spf).raw).toBe(0.02);
  expect(currencyConverter.getPrice(spf, 'usd').raw).toBe(0.014);
  expect(currencyConverter.getPrice(AssetInfo.splash).raw).toBe(0);

  expect(currencyConverter.convert(Currency.spf(100n))).toBeInstanceOf(
    Currency,
  );
  expect(currencyConverter.convert(Currency.spf(100n)).toString()).toBe('2');
  expect(currencyConverter.convert(Currency.spf(100n), 'usd').toString()).toBe(
    '1.4',
  );
});
