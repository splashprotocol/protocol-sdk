import { Price } from '../price/Price.ts';
import { Pair } from './Pair.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';

test('It should create valid pair instance', () => {
  const spfAdaPrice = Price.new({
    base: AssetInfo.spf,
    quote: AssetInfo.ada,
    value: '0.2',
  });
  const adaAdaPrice = Price.new({
    base: AssetInfo.ada,
    quote: AssetInfo.ada,
    value: '1',
  });

  const pair = Pair.new({
    base: AssetInfo.spf,
    quote: AssetInfo.ada,
    spotPrice: spfAdaPrice,
    baseAdaPrice: spfAdaPrice,
    quoteAdaPrice: adaAdaPrice,
    change: 9,
    priceMinStep: spfAdaPrice,
  });
  expect(pair).toBeInstanceOf(Pair);
  expect(pair.base).toBe(AssetInfo.spf);
  expect(pair.quote).toBe(AssetInfo.ada);
  expect(pair.spotPrice).toBeInstanceOf(Price);
  expect(pair.spotPrice.raw).toBe('0.2');
  expect(pair.prevSpotPrice).toBeInstanceOf(Price);
  expect(pair.baseAdaPrice).toBeInstanceOf(Price);
  expect(pair.baseAdaPrice.raw).toBe('0.2');
  expect(pair.quoteAdaPrice).toBeInstanceOf(Price);
  expect(pair.quoteAdaPrice.raw).toBe('1');
});
