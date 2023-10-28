import {
  BigNum,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-browser';

//
import { bytesToHex } from '../../utils/bytesToHex/bytesToHex.ts';
import { Datum, spectrumDatumPostHandler } from './Datum.ts';
import { SpectrumBigIntDatumType } from './types/SpectrumBigIntDatumType/SpectrumBigIntDatumType.ts';
import { SpectrumDatumByteHexString } from './types/SpectrumDatumByteHexString/SpectrumDatumByteHexString.ts';

test('it should creates a valid instance of Datum from params', () => {
  const datum = new Datum(
    {
      amount: [0, SpectrumBigIntDatumType],
    },
    spectrumDatumPostHandler,
  );

  expect(datum).toBeInstanceOf(Datum);
  expect(datum.schema.amount).toEqual([0, SpectrumBigIntDatumType]);
});

test('it should converts objects to PlutusData structure', () => {
  const expectedBigInt = 1n;
  const expectedHex =
    '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
  const datum = new Datum(
    {
      amount: [0, SpectrumBigIntDatumType],
      asset: [1, SpectrumDatumByteHexString],
    },
    spectrumDatumPostHandler,
  );
  const pd = datum.serialize({ amount: expectedBigInt, asset: expectedHex });

  expect(pd).toBeInstanceOf(PlutusData);
  expect(
    BigInt(pd.as_constr_plutus_data()?.data().get(0).as_integer()?.to_str()!),
  ).toBe(expectedBigInt);
  expect(
    bytesToHex(pd.as_constr_plutus_data()?.data().get(1).as_bytes()!),
  ).toBe(expectedHex);
});

test('it should throws error on incorrect data', () => {
  const datum = new Datum(
    {
      amount: [0, SpectrumBigIntDatumType],
    },
    spectrumDatumPostHandler,
  );

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
  const datum = new Datum(
    {
      amount: [0, SpectrumBigIntDatumType],
      asset: [1, SpectrumDatumByteHexString],
    },
    spectrumDatumPostHandler,
  );

  const plutusList = PlutusList.new();
  plutusList.add(SpectrumBigIntDatumType.serialize(expectedBigInt));
  plutusList.add(SpectrumDatumByteHexString.serialize(expectedHex));

  const deserializationResult = datum.deserialize(
    PlutusData.new_constr_plutus_data(
      ConstrPlutusData.new(BigNum.zero(), plutusList),
    ),
  );

  expect(deserializationResult).toEqual({
    amount: expectedBigInt,
    asset: expectedHex,
  });
});

test('it should throws deserialization error with invalid plutus data', () => {
  const datum = new Datum(
    {
      amount: [0, SpectrumBigIntDatumType],
      asset: [1, SpectrumDatumByteHexString],
    },
    spectrumDatumPostHandler,
  );

  try {
    datum.deserialize(PlutusData.new_bytes(Uint8Array.from([])));
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});
