import {
  BigInt as WasmBigInt,
  PlutusData,
} from '@emurgo/cardano-serialization-lib-browser';

import { SpectrumBigIntDatumType } from './SpectrumBigIntDatumType.ts';

test('it should convert bigint to plutus data', () => {
  const bigintDatum = SpectrumBigIntDatumType.serialize(1n);

  expect(bigintDatum).toBeInstanceOf(PlutusData);
  expect(BigInt(bigintDatum.as_integer()?.to_str()!)).toBe(1n);
});

test('it should convert plutus data to bigint', () => {
  const bigintDatum = PlutusData.new_integer(
    WasmBigInt.from_str(1n.toString()),
  );
  const bigintValue = SpectrumBigIntDatumType.deserialize(bigintDatum);

  expect(typeof bigintValue).toBe('bigint');
  expect(bigintValue).toBe(1n);
});
