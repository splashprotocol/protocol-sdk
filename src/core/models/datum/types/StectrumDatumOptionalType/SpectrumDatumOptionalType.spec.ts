import { SpectrumBigIntDatumType } from '../SpectrumBigIntDatumType/SpectrumBigIntDatumType.ts';
import { SpectrumDatumByteHexString } from '../SpectrumDatumByteHexString/SpectrumDatumByteHexString.ts';
import { SpectrumDatumOptionalType } from './SpectrumDatumOptionalType.ts';

test('it should serialize bigint value like optional', () => {
  const bigintOptinalDatum = SpectrumDatumOptionalType(
    SpectrumBigIntDatumType,
  ).serialize(1n);

  expect(
    SpectrumBigIntDatumType.deserialize(
      bigintOptinalDatum.as_constr_plutus_data()?.data().get(0)!,
    ),
  ).toBe(1n);
});

test('it should serialize hex string value like optional', () => {
  const expectedHex =
    '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
  const bigintOptinalDatum = SpectrumDatumOptionalType(
    SpectrumDatumByteHexString,
  ).serialize(expectedHex);

  expect(
    SpectrumDatumByteHexString.deserialize(
      bigintOptinalDatum.as_constr_plutus_data()?.data().get(0)!,
    ),
  ).toBe(expectedHex);
});
