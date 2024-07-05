import { ada } from '../assetInfo/ada.ts';
import { spf } from '../assetInfo/spf.ts';
import { usd } from '../assetInfo/usd.ts';
import { Currency } from '../currency/Currency.ts';
import { Price } from './Price.ts';

test('it should create valid price instance', () => {
  const price = Price.new({
    raw: '0.2',
    base: spf,
    quote: ada,
  });

  expect(price).toBeInstanceOf(Price);
  expect(price.base).toBe(spf);
  expect(price.quote).toBe(ada);
  expect(price.raw).toBe('0.2');
});

test('it should returns inverted price', () => {
  const invertedPrice = Price.new({
    raw: '0.2',
    base: spf,
    quote: ada,
  }).invert();

  expect(invertedPrice).toBeInstanceOf(Price);
  expect(invertedPrice.base).toBe(ada);
  expect(invertedPrice.quote).toBe(spf);
  expect(invertedPrice.raw).toBe('5');
});

test('it should returns valid amount of ada needed for specified spf amount', () => {
  const price = Price.new({
    raw: '0.042023',
    base: spf,
    quote: ada,
  });

  const neededAda = price.getNecessaryQuoteFor(50n);
  expect(neededAda).toBeInstanceOf(Currency);
  expect(neededAda.toString()).toBe('0.000002');
  expect(neededAda.asset).toBe(ada);
});

test('it should returns valid amount of spf which user receive using specified ada amount', () => {
  const price = Price.new({
    raw: '0.042233',
    base: spf,
    quote: ada,
  });

  const receivedSpf = price.getReceivedBaseFor(5n);

  expect(receivedSpf).toBeInstanceOf(Currency);
  expect(receivedSpf.toString()).toBe('0.000118');
  expect(receivedSpf.asset).toBe(spf);
});

test('it should returns valid cross price', () => {
  const spfAdaPrice = Price.new({
    raw: '0.02',
    base: spf,
    quote: ada,
  });
  const usdAdaPrice = Price.new({
    raw: '0.25',
    base: ada,
    quote: usd,
  });
  const spfUsdPrice = spfAdaPrice.cross(usdAdaPrice);

  expect(spfUsdPrice).toBeInstanceOf(Price);
  expect(spfUsdPrice.raw).toBe('0.005');
});

test('It should returns valid string representation of price', () => {
  const usdAdaPrice = Price.new({
    raw: '0.25',
    base: ada,
    quote: usd,
  });
  const usdAdaPrice2 = Price.new({
    raw: '0.0',
    base: ada,
    quote: usd,
  });
  const usdAdaPrice3 = Price.new({
    raw: '0',
    base: ada,
    quote: usd,
  });
  const usdAdaPrice4 = Price.new({
    raw: '0.00123',
    base: ada,
    quote: usd,
  });

  expect(usdAdaPrice.toString()).toBe('0.000025');
  expect(usdAdaPrice2.toString()).toBe('0');
  expect(usdAdaPrice3.toString()).toBe('0');
  expect(usdAdaPrice4.toString()).toBe('0.000000123');
});
