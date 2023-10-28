import {
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-browser';

import { bytesToHex } from '../../utils/bytesToHex/bytesToHex.ts';
import { Datum } from './Datum.ts';
import { BigIntDatumType } from './types/BigIntDatumType/BigIntDatumType.ts';
import { DatumByteHexString } from './types/DatumByteHexString/DatumByteHexString.ts';

test('it should creates a valid instance of Datum from params', () => {
  const datum = new Datum({
    amount: [0, BigIntDatumType],
  });

  expect(datum).toBeInstanceOf(Datum);
  expect(datum.schema.amount).toEqual([0, BigIntDatumType]);
});

test('it should converts objects to PlutusData structure', () => {
  const expectedBigInt = 1n;
  const expectedHex =
    '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
  const datum = new Datum({
    amount: [0, BigIntDatumType],
    asset: [1, DatumByteHexString],
  });
  const pd = datum.serialize({ amount: expectedBigInt, asset: expectedHex });

  expect(pd).toBeInstanceOf(PlutusData);
  expect(BigInt(pd.as_list()?.get(0).as_integer()?.to_str()!)).toBe(
    expectedBigInt,
  );
  expect(bytesToHex(pd.as_list()?.get(1).as_bytes()!)).toBe(expectedHex);
});

test('it should throws error on incorrect data', () => {
  const datum = new Datum({
    amount: [0, BigIntDatumType],
  });

  try {
    datum.serialize({ amount: null as any });
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should converts PlutusData structure to object', () => {
  const expectedBigInt = 1n;
  const expectedHex =
    '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
  const datum = new Datum({
    amount: [0, BigIntDatumType],
    asset: [1, DatumByteHexString],
  });

  const plutusList = PlutusList.new();
  plutusList.add(BigIntDatumType.serialize(expectedBigInt));
  plutusList.add(DatumByteHexString.serialize(expectedHex));

  const deserializationResult = datum.deserialize(
    PlutusData.new_list(plutusList),
  );

  expect(deserializationResult).toEqual({
    amount: expectedBigInt,
    asset: expectedHex,
  });
});

test('it should converts PlutusData structure to object', () => {
  const expectedBigInt = 1n;
  const expectedHex =
    '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
  const datum = new Datum({
    amount: [0, BigIntDatumType],
    asset: [1, DatumByteHexString],
  });

  const plutusList = PlutusList.new();
  plutusList.add(BigIntDatumType.serialize(expectedBigInt));
  plutusList.add(DatumByteHexString.serialize(expectedHex));

  const deserializationResult = datum.deserialize(
    PlutusData.new_list(plutusList),
  );

  expect(deserializationResult).toEqual({
    amount: expectedBigInt,
    asset: expectedHex,
  });
});

test('it should throws deserialization error with invalid plutus data', () => {
  const datum = new Datum({
    amount: [0, BigIntDatumType],
    asset: [1, DatumByteHexString],
  });

  try {
    datum.deserialize(PlutusData.new_bytes(Uint8Array.from([])));
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});
