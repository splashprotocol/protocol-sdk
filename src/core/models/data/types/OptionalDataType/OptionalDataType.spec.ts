import { BigIntegerDataType } from '../BigIntegerDataType/BigIntegerDataType.ts';
import { BytesDataType } from '../BytesDataType/BytesDataType.ts';
import { OptionalDataType } from './OptionalDataType.ts';

test('it should serialize bigint value like optional', () => {
  const bigintOptinalDatum = OptionalDataType(BigIntegerDataType)(1n);

  expect(
    BigIntegerDataType.deserialize(
      bigintOptinalDatum.as_constr_plutus_data()?.fields().get(0)!,
    ),
  ).toBe(1n);
});

test('it should serialize hex string value like optional', () => {
  const expectedHex =
    '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
  const bigintOptinalDatum = OptionalDataType(BytesDataType)(expectedHex);

  expect(
    BytesDataType.deserialize(
      bigintOptinalDatum.as_constr_plutus_data()?.fields().get(0)!,
    ),
  ).toBe(expectedHex);
});
