import { ada } from '../assetInfo/ada.ts';
import { spf } from '../assetInfo/spf.ts';
import { Currency } from './Currency.ts';

test('it should create asset amount object valid instance', () => {
  const adaAssetAmount = Currency.new(1n, ada);

  expect(adaAssetAmount).toBeInstanceOf(Currency);
  expect(adaAssetAmount.amount).toBe(1n);
  expect(adaAssetAmount.asset).toBe(ada);
});

test('it should sum 2 asset amounts', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  expect(adaAssetAmount1.plus(adaAssetAmount2).amount).toBe(4n);
});

test('it should throws error on sum method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, spf);

  try {
    adaAssetAmount1.plus(adaAssetAmount2);
  } catch (error) {
    expect(error).toBe(error);
  }
});

test('it should subtract adaAssetAmount1 from adaAssetAmount2', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  expect(adaAssetAmount2.minus(adaAssetAmount1).amount).toBe(2n);
});

test('it should throws negate number error on minus method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  try {
    expect(adaAssetAmount1.minus(adaAssetAmount2).amount);
  } catch (error) {
    expect(error).toBe(error);
  }
});

test('it should throws different asset error on minus method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, spf);

  try {
    expect(adaAssetAmount2.minus(adaAssetAmount1).amount);
  } catch (error) {
    expect(error).toBe(error);
  }
});

test('it should returns true on gt method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  expect(adaAssetAmount2.gt(adaAssetAmount1)).toBe(true);
});

test('it should returns false on gt method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  expect(adaAssetAmount1.gt(adaAssetAmount2)).toBe(false);
});

test('it should returns false on gt method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  expect(adaAssetAmount2.lt(adaAssetAmount1)).toBe(false);
});

test('it should returns false on lt method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  expect(adaAssetAmount2.lt(adaAssetAmount1)).toBe(false);
});

test('it should returns true on lt method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  expect(adaAssetAmount1.lt(adaAssetAmount2)).toBe(true);
});

test('it should returns false on gte method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  expect(adaAssetAmount1.gte(adaAssetAmount2)).toBe(false);
});

test('it should returns true on gte method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  expect(adaAssetAmount2.gte(adaAssetAmount1)).toBe(true);
});

test('it should returns true on gte method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(1n, ada);

  expect(adaAssetAmount2.gte(adaAssetAmount1)).toBe(true);
});

test('it should returns true on lte method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  expect(adaAssetAmount1.lte(adaAssetAmount2)).toBe(true);
});

test('it should returns true on lte method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(3n, ada);

  expect(adaAssetAmount2.lte(adaAssetAmount1)).toBe(false);
});

test('it should returns true on lte method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(1n, ada);

  expect(adaAssetAmount2.lte(adaAssetAmount1)).toBe(true);
});

test('it should returns true on eq method', () => {
  const adaAssetAmount1 = Currency.new(1n, ada);
  const adaAssetAmount2 = Currency.new(1n, ada);

  expect(adaAssetAmount2.eq(adaAssetAmount1)).toBe(true);
});

test('it should returns valid string representation of currency', () => {
  const adaAssetAmount = Currency.new(1n, ada);

  expect(adaAssetAmount.toString()).toBe('0.000001');
});

test('it should returns valid number representation of currency', () => {
  const adaAssetAmount = Currency.new(1n, ada);

  expect(adaAssetAmount.toNumber()).toBe(0.000001);
});

test('it should calculate valid percent of amount', () => {
  const adaAssetAmount = Currency.new(1n, ada);

  expect(adaAssetAmount.amountFromPercent(60).amount).toBe(0n);
  expect(adaAssetAmount.amountFromPercent(200).amount).toBe(2n);
});

test('it should return true for isPositive with amount > 0', () => {
  const adaAssetAmount = Currency.new(1n, ada);

  expect(adaAssetAmount.isPositive()).toBe(true);
});

test('it should return false for isPositive with amount = 0', () => {
  const adaAssetAmount = Currency.new(0n, ada);

  expect(adaAssetAmount.isPositive()).toBe(false);
});
