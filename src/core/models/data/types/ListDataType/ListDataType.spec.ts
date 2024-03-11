import {
  PlutusData,
  PlutusDataList,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { BigIntegerDataType } from '../BigIntegerDataType/BigIntegerDataType.ts';
import { ListDataType } from './ListDataType.ts';

test('it should serialises list of bigint', () => {
  const expectedDatumList = PlutusDataList.new();
  expectedDatumList.add(BigIntegerDataType(1n));
  expectedDatumList.add(BigIntegerDataType(2n));
  expectedDatumList.add(BigIntegerDataType(3n));
  const expectedDatum = PlutusData.new_list(expectedDatumList);

  expect(ListDataType(BigIntegerDataType)([1n, 2n, 3n]).to_cbor_hex()).toBe(
    expectedDatum.to_cbor_hex(),
  );
});

test('it should deserializes datum list representation to bigint[]', () => {
  const expectedBigintList = [1n, 2n, 3n];
  const datumList = PlutusDataList.new();
  datumList.add(BigIntegerDataType(1n));
  datumList.add(BigIntegerDataType(2n));
  datumList.add(BigIntegerDataType(3n));
  const datum = PlutusData.new_list(datumList);

  expect(ListDataType(BigIntegerDataType).deserialize(datum)).toEqual(
    expectedBigintList,
  );
});
