import {
  BigInteger,
  PlutusData,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { IntegerDataType } from './IntegerDataType.ts';

test('it should convert int to plutus data', () => {
  const bigintDatum = IntegerDataType(1);

  expect(bigintDatum).toBeInstanceOf(PlutusData);
  expect(Number(bigintDatum.as_integer()?.to_str()!)).toBe(1);
});

test('it should convert plutus data to int', () => {
  const intPd = PlutusData.new_integer(BigInteger.from_str((1).toString()));
  const intValue = IntegerDataType.deserialize(intPd);

  expect(typeof intValue).toBe('number');
  expect(intValue).toBe(1);
});
