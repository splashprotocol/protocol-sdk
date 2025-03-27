import { Price } from './Price.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { Currency } from '../currency/Currency.ts';

test('it should create valid price instance from string', () => {
  const price = Price.new({
    value: '0.2',
    base: AssetInfo.spf,
    quote: AssetInfo.ada,
  });

  expect(price).toBeInstanceOf(Price);
  expect(price.base).toBe(AssetInfo.spf);
  expect(price.quote).toBe(AssetInfo.ada);
  expect(price.raw).toBe('0.2');
  expect(price.rational.numerator).toBe(2n);
  expect(price.rational.denominator).toBe(10n);
});

test('it should create valid price instance from rational', () => {
  const price = Price.new({
    value: {
      numerator: 2n,
      denominator: 10n,
    },
    base: AssetInfo.spf,
    quote: AssetInfo.ada,
  });

  expect(price).toBeInstanceOf(Price);
  expect(price.base).toBe(AssetInfo.spf);
  expect(price.quote).toBe(AssetInfo.ada);
  expect(price.raw).toBe('0.2');
  expect(price.rational.numerator).toBe(2n);
  expect(price.rational.denominator).toBe(10n);
});

test('it should returns inverted price', () => {
  const invertedPrice = Price.new({
    value: '0.2',
    base: AssetInfo.spf,
    quote: AssetInfo.ada,
  }).invert();

  expect(invertedPrice).toBeInstanceOf(Price);
  expect(invertedPrice.base).toBe(AssetInfo.ada);
  expect(invertedPrice.quote).toBe(AssetInfo.spf);
  expect(invertedPrice.raw).toBe('5');
  expect(invertedPrice.rational.numerator).toBe(5n);
  expect(invertedPrice.rational.denominator).toBe(1n);
});

test('it should returns valid amount of ada needed for specified spf amount', () => {
  const price = Price.new({
    value: '0.02',
    base: AssetInfo.spf,
    quote: AssetInfo.ada,
  });

  const neededAda = price.getNecessaryQuoteFor(50n);
  expect(neededAda).toBeInstanceOf(Currency);
  expect(neededAda.amount).toBe(1n);
  expect(neededAda.asset).toBe(AssetInfo.ada);
});

test('it should returns valid amount of spf which user receive using specified ada amount', () => {
  const price = Price.new({
    value: '0.02',
    base: AssetInfo.spf,
    quote: AssetInfo.ada,
  });

  const receivedSpf = price.getReceivedBaseFor(1n);
  const receivedSpf2 = price.getReceivedBaseFor(5n);

  expect(receivedSpf).toBeInstanceOf(Currency);
  expect(receivedSpf.amount).toBe(50n);
  expect(receivedSpf2.amount).toBe(250n);
  expect(receivedSpf.asset).toBe(AssetInfo.spf);
});

test('it should returns valid cross price', () => {
  const spfAdaPrice = Price.new({
    value: '0.02',
    base: AssetInfo.spf,
    quote: AssetInfo.ada,
  });
  const usdAdaPrice = Price.new({
    value: '0.25',
    base: AssetInfo.ada,
    quote: AssetInfo.usd,
  });
  const adaUsdPrice = Price.new({
    value: '4',
    base: AssetInfo.usd,
    quote: AssetInfo.ada,
  });
  const spfUsdPrice = spfAdaPrice.cross(usdAdaPrice);
  const spfUsdPrice2 = spfAdaPrice.cross(adaUsdPrice);

  expect(spfUsdPrice).toBeInstanceOf(Price);
  expect(spfUsdPrice.raw).toBe('0.005');
  expect(spfUsdPrice2.raw).toBe('0.005');
});

//
test('It should returns valid string representation of price', () => {
  const usdAdaPrice = Price.new({
    value: '0.25',
    base: AssetInfo.ada,
    quote: AssetInfo.usd,
  });
  const usdAdaPrice2 = Price.new({
    value: '0.0',
    base: AssetInfo.ada,
    quote: AssetInfo.usd,
  });
  const usdAdaPrice3 = Price.new({
    value: '0',
    base: AssetInfo.ada,
    quote: AssetInfo.usd,
  });
  const usdAdaPrice4 = Price.new({
    value: '0.00123',
    base: AssetInfo.ada,
    quote: AssetInfo.usd,
  });

  expect(usdAdaPrice.toString()).toBe('2500');
  expect(usdAdaPrice2.toString()).toBe('0');
  expect(usdAdaPrice3.toString()).toBe('0');
  expect(usdAdaPrice4.toString()).toBe('12.3');
});
