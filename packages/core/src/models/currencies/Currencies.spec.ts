import { Currency } from '../currency/Currency.ts';
import { Currencies } from './Currencies.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { EMISSION_LP } from '../pool/common/emissionLp.ts';

// Currencies.fromCbor('', (c) => AssetInfo.ada.metadata);

const cbor =
  '821864a1581c09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75a1435350461b7fffffffffffffff';

test('it should create valid instance of Currencies from array', () => {
  const currencies = Currencies.new([Currency.new(1n, AssetInfo.spf)]);
  expect(currencies).toBeInstanceOf(Currencies);
  expect(currencies.spf.amount).toBe(1n);
  expect(currencies.spf.asset).toBe(AssetInfo.spf);
});

test('it should create valid instance of AssetAmountSet from cbor', () => {
  const currencies = Currencies.fromCbor(cbor);
  expect(currencies).toBeInstanceOf(Currencies);
  expect(currencies.ada.amount).toBe(100n);
  expect(currencies.ada.asset.assetId).toBe(AssetInfo.ada.assetId);
  expect(currencies.spf.amount).toBe(EMISSION_LP);
  expect(currencies.spf.asset.assetId).toBe(AssetInfo.spf.assetId);
});

test('it should create valid instance of AssetAmountSet from cbor and meta', () => {
  const currencies = Currencies.fromCbor(cbor, () => undefined);
  expect(currencies).toBeInstanceOf(Currencies);
  expect(currencies.ada.amount).toBe(100n);
  expect(currencies.ada.asset.assetId).toBe(AssetInfo.ada.assetId);
  expect(currencies.spf.amount).toBe(EMISSION_LP);
  expect(currencies.spf.asset.assetId).toBe(AssetInfo.spf.assetId);
});

test('it should create valid instance of AssetAmountSet from cbor and promise meta', async () => {
  const currencies = await Currencies.fromCbor(cbor, () =>
    Promise.resolve(undefined),
  );
  expect(currencies).toBeInstanceOf(Currencies);
  expect(currencies.ada.amount).toBe(100n);
  expect(currencies.ada.asset.assetId).toBe(AssetInfo.ada.assetId);
  expect(currencies.spf.amount).toBe(EMISSION_LP);
  expect(currencies.spf.asset.assetId).toBe(AssetInfo.spf.assetId);
});

test('it should get ada asset amount', () => {
  const currencies = Currencies.fromCbor(cbor);
  const adaAmount = currencies.ada;

  expect(adaAmount?.amount).toBe(100n);
  expect(adaAmount?.asset.assetId).toBe(AssetInfo.ada.assetId);
});

test('it should get spf asset amount', () => {
  const currencies = Currencies.fromCbor(cbor);
  const spfAmount = currencies.spf;

  expect(spfAmount?.amount).toBe(EMISSION_LP);
  expect(spfAmount?.asset.assetId).toBe(AssetInfo.spf.assetId);
});

test('it should get asset amount by asset info', () => {
  const currencies = Currencies.fromCbor(cbor);
  const spfAmount = currencies.get(AssetInfo.spf);
  const adaAmount = currencies.get(AssetInfo.ada);

  expect(spfAmount?.amount).toBe(EMISSION_LP);
  expect(spfAmount?.asset.assetId).toBe(AssetInfo.spf.assetId);

  expect(adaAmount?.amount).toBe(100n);
  expect(adaAmount?.asset.assetId).toBe(AssetInfo.ada.assetId);
});

test('it should concat all same currencies on creation', () => {
  const set1 = Currencies.new([Currency.ada(4n), Currency.ada(3n)]);

  expect(set1.ada.amount).toBe(7n);
});

test('it should sum 2 sets with different currencies', () => {
  const set1 = Currencies.new([Currency.ada(4n)]);
  const set2 = Currencies.new([Currency.spf(3n)]);
  const sum = set1.plus(set2);

  expect(sum).toBeInstanceOf(Currencies);
  expect(sum.spf?.amount).toBe(3n);
  expect(sum.ada?.amount).toBe(4n);
});
//
test('it should sum 2 sets with same assets', () => {
  const set1 = Currencies.new([Currency.ada(4n)]);
  const set2 = Currencies.new([Currency.ada(3n)]);
  const sum = set1.plus(set2);

  expect(sum).toBeInstanceOf(Currencies);
  expect(sum.ada?.amount).toBe(7n);
});

test('it should subtract set2 from set1', () => {
  const set1 = Currencies.new([Currency.ada(4n)]);
  const set2 = Currencies.new([Currency.ada(3n)]);
  const minusRes = set1.minus(set2);

  expect(minusRes).toBeInstanceOf(Currencies);
  expect(minusRes.ada?.amount).toBe(1n);
});

test('it should returns insufficient assets', () => {
  const set1 = Currencies.new([Currency.ada(3n), Currency.usd(2n)]);
  const set2 = Currencies.new([
    Currency.ada(4n),
    Currency.spf(3n),
    Currency.usd(2n),
  ]);
  const insufficient = set1.getInsufficientCurrenciesFor(set2);

  expect(insufficient).toBeInstanceOf(Currencies);
  expect(insufficient.ada?.amount).toBe(1n);
  expect(insufficient.spf?.amount).toBe(3n);
});

test('it should throws error after subtract same assets method call', () => {
  const set1 = Currencies.new([Currency.ada(4n)]);
  const set2 = Currencies.new([Currency.ada(3n)]);

  try {
    set2.minus(set1);
  } catch (error) {
    expect(error).toBe(error);
  }
});

test('it should throws error after subtract different assets method call', () => {
  const set1 = Currencies.new([Currency.spf(4n)]);
  const set2 = Currencies.new([Currency.ada(3n)]);

  try {
    set2.minus(set1);
  } catch (error) {
    expect(error).toBe(error);
  }
});

test('it should returns true after isAssetsEnough method call', () => {
  const set1 = Currencies.new([Currency.ada(4n)]);
  const set2 = Currencies.new([Currency.ada(3n)]);

  expect(set1.isAssetsEnough(set2)).toBe(true);
});

test('it should returns false after isAssetsEnough method call', () => {
  const set1 = Currencies.new([Currency.ada(4n)]);
  const set2 = Currencies.new([Currency.ada(3n)]);

  expect(set2.isAssetsEnough(set1)).toBe(false);
});
