import { ada } from '../assetInfo/ada.ts';
import { spf } from '../assetInfo/spf.ts';
import { Price } from '../price/Price.ts';
import { Pair } from './Pair.ts';

test('It should create valid pair instance', () => {
  const spfAdaPrice = Price.new({
    base: spf,
    quote: ada,
    raw: 0.2,
  });
  const adaAdaPrice = Price.new({
    base: ada,
    quote: ada,
    raw: 1,
  });

  const pair = Pair.new({
    base: spf,
    quote: ada,
    spotPrice: spfAdaPrice,
    baseAdaPrice: spfAdaPrice,
    quoteAdaPrice: adaAdaPrice,
    change: 9,
  });

  expect(pair).toBeInstanceOf(Pair);
  expect(pair.base).toBe(spf);
  expect(pair.quote).toBe(ada);
  expect(pair.spotPrice).toBeInstanceOf(Price);
  expect(pair.spotPrice.raw).toBe(0.2);
  expect(pair.baseAdaPrice).toBeInstanceOf(Price);
  expect(pair.baseAdaPrice.raw).toBe(0.2);
  expect(pair.quoteAdaPrice).toBeInstanceOf(Price);
  expect(pair.quoteAdaPrice.raw).toBe(1);
});
