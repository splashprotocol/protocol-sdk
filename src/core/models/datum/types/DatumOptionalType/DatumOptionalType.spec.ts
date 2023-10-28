import { BigIntDatumType } from '../BigIntDatumType/BigIntDatumType.ts';
import { DatumByteHexString } from '../DatumByteHexString/DatumByteHexString.ts';
import { DatumOptionalType } from './DatumOptionalType.ts';

test('it should serialize bigint value like optional', () => {
  const bigintOptinalDatum = DatumOptionalType(BigIntDatumType).serialize(1n);

  expect(
    BigIntDatumType.deserialize(
      bigintOptinalDatum.as_constr_plutus_data()?.data().get(0)!,
    ),
  ).toBe(1n);
});

test('it should serialize hex string value like optional', () => {
  const expectedHex =
    '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
  const bigintOptinalDatum =
    DatumOptionalType(DatumByteHexString).serialize(expectedHex);

  expect(
    DatumByteHexString.deserialize(
      bigintOptinalDatum.as_constr_plutus_data()?.data().get(0)!,
    ),
  ).toBe(expectedHex);
});
