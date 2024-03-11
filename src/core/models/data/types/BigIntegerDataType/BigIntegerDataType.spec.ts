import {
  BigInteger,
  PlutusData,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { BigIntegerDataType } from './BigIntegerDataType.ts';

test('it should convert bigint to plutus data', () => {
  const bigintDatum = BigIntegerDataType(1n);

  expect(bigintDatum).toBeInstanceOf(PlutusData);
  expect(BigInt(bigintDatum.as_integer()?.to_str()!)).toBe(1n);
});

test('it should convert plutus data to bigint', () => {
  const bigintDatum = PlutusData.new_integer(
    BigInteger.from_str(1n.toString()),
  );
  const bigintValue = BigIntegerDataType.deserialize(bigintDatum);

  expect(typeof bigintValue).toBe('bigint');
  expect(bigintValue).toBe(1n);
});
