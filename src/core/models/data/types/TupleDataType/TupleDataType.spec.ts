import {
  ConstrPlutusData,
  PlutusData,
  PlutusDataList,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { spf } from '../../../assetInfo/spf.ts';
import { AssetInfoDataType } from '../AssetInfoDataType/AssetInfoDataType.ts';
import { IntegerDataType } from '../IntegerDataType/IntegerDataType.ts';
import { TupleDataType } from './TupleDataType.ts';

test('it should serialize a tuple for datum1', () => {
  const datum1 = TupleDataType([IntegerDataType]);

  const expectedDataList = PlutusDataList.new();
  expectedDataList.add(IntegerDataType(1));
  const expectedResult = PlutusData.new_constr_plutus_data(
    ConstrPlutusData.new(0n, expectedDataList),
  );

  expect(datum1([1]).to_cbor_hex()).toBe(expectedResult.to_cbor_hex());
});

test('it should serialize a tuple for datum2', () => {
  const datum1 = TupleDataType([IntegerDataType, AssetInfoDataType]);

  const expectedDataList = PlutusDataList.new();
  expectedDataList.add(IntegerDataType(1));
  expectedDataList.add(AssetInfoDataType(spf));
  const expectedResult = PlutusData.new_constr_plutus_data(
    ConstrPlutusData.new(0n, expectedDataList),
  );

  expect(datum1([1, spf]).to_cbor_hex()).toBe(expectedResult.to_cbor_hex());
});

test('it should deserialize a tuple for datum1', () => {
  const datum1 = TupleDataType([IntegerDataType]);

  const dataListToCompare = PlutusDataList.new();
  dataListToCompare.add(IntegerDataType(1));
  const datumToCompare = PlutusData.new_constr_plutus_data(
    ConstrPlutusData.new(0n, dataListToCompare),
  );

  expect(datum1.deserialize(datumToCompare)).toStrictEqual([1]);
});

test('it should deserialize a tuple for datum2', () => {
  const datum1 = TupleDataType([IntegerDataType, AssetInfoDataType]);

  const dataListToCompare = PlutusDataList.new();
  dataListToCompare.add(IntegerDataType(1));
  dataListToCompare.add(AssetInfoDataType(spf));
  const datumToCompare = PlutusData.new_constr_plutus_data(
    ConstrPlutusData.new(0n, dataListToCompare),
  );
  const deserializedDatum = datum1.deserialize(datumToCompare);

  expect(deserializedDatum[0]).toBe(1);
  expect(deserializedDatum[1].splashId).toBe(spf.splashId);
});
