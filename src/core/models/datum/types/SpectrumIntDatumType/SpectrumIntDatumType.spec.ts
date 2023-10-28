import {
  BigInt as WasmBigInt,
  PlutusData,
} from '@emurgo/cardano-serialization-lib-browser';

import { SpectrumIntDatumType } from './SpectrumIntDatumType.ts';

test('it should convert int to plutus data', () => {
  const bigintDatum = SpectrumIntDatumType.serialize(1);

  expect(bigintDatum).toBeInstanceOf(PlutusData);
  expect(Number(bigintDatum.as_integer()?.to_str()!)).toBe(1);
});

test('it should convert plutus data to int', () => {
  const intPd = PlutusData.new_integer(WasmBigInt.from_str((1).toString()));
  const intValue = SpectrumIntDatumType.deserialize(intPd);

  expect(typeof intValue).toBe('number');
  expect(intValue).toBe(1);
});
