import { adaAssetInfo } from '../assetInfo/adaAssetInfo.ts';
import { spfAssetInfo } from '../assetInfo/spfAssetInfo.ts';
import { AssetAmount } from './AssetAmount.ts';

test('it should create asset amount object valid instance', () => {
  const adaAssetAmount = new AssetAmount(1n, adaAssetInfo);

  expect(adaAssetAmount).toBeInstanceOf(AssetAmount);
  expect(adaAssetAmount.amount).toBe(1n);
  expect(adaAssetAmount.assetInfo).toBe(adaAssetInfo);
});

test('it should sum 2 asset amounts', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  expect(adaAssetAmount1.plus(adaAssetAmount2).amount).toBe(4n);
});

test('it should throws error on sum method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, spfAssetInfo);

  try {
    adaAssetAmount1.plus(adaAssetAmount2);
  } catch (error) {
    expect(error).toBe(error);
  }
});

test('it should subtract adaAssetAmount1 from adaAssetAmount2', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  expect(adaAssetAmount2.minus(adaAssetAmount1).amount).toBe(2n);
});

test('it should throws negate number error on minus method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  try {
    expect(adaAssetAmount1.minus(adaAssetAmount2).amount);
  } catch (error) {
    expect(error).toBe(error);
  }
});

test('it should throws different asset error on minus method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, spfAssetInfo);

  try {
    expect(adaAssetAmount2.minus(adaAssetAmount1).amount);
  } catch (error) {
    expect(error).toBe(error);
  }
});

test('it should returns true on gt method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  expect(adaAssetAmount2.gt(adaAssetAmount1)).toBe(true);
});

test('it should returns false on gt method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  expect(adaAssetAmount1.gt(adaAssetAmount2)).toBe(false);
});

test('it should returns false on gt method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  expect(adaAssetAmount2.lt(adaAssetAmount1)).toBe(false);
});

test('it should returns false on lt method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  expect(adaAssetAmount2.lt(adaAssetAmount1)).toBe(false);
});

test('it should returns true on lt method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  expect(adaAssetAmount1.lt(adaAssetAmount2)).toBe(true);
});

test('it should returns false on gte method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  expect(adaAssetAmount1.gte(adaAssetAmount2)).toBe(false);
});

test('it should returns true on gte method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  expect(adaAssetAmount2.gte(adaAssetAmount1)).toBe(true);
});

test('it should returns true on gte method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(1n, adaAssetInfo);

  expect(adaAssetAmount2.gte(adaAssetAmount1)).toBe(true);
});

test('it should returns true on lte method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  expect(adaAssetAmount1.lte(adaAssetAmount2)).toBe(true);
});

test('it should returns true on lte method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(3n, adaAssetInfo);

  expect(adaAssetAmount2.lte(adaAssetAmount1)).toBe(false);
});

test('it should returns true on lte method', () => {
  const adaAssetAmount1 = new AssetAmount(1n, adaAssetInfo);
  const adaAssetAmount2 = new AssetAmount(1n, adaAssetInfo);

  expect(adaAssetAmount2.lte(adaAssetAmount1)).toBe(true);
});
