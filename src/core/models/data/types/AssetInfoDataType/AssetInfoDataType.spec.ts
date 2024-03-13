import {
  ConstrPlutusData,
  PlutusData,
  PlutusDataList,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { bytesToHex } from '../../../../utils/bytesToHex/bytesToHex.ts';
import { hexToBytes } from '../../../../utils/hexToBytes/hexToBytes.ts';
import { AssetInfo } from '../../../assetInfo/AssetInfo.ts';
import { spf } from '../../../assetInfo/spf.ts';
import { AssetInfoDataType } from './AssetInfoDataType.ts';

test('it should converts assetInfo to plutus data', () => {
  const assetInfoDatum = AssetInfoDataType(spf);
  expect(assetInfoDatum).toBeInstanceOf(PlutusData);
  expect(
    bytesToHex(
      assetInfoDatum.as_constr_plutus_data()?.fields().get(0).as_bytes()!,
    ),
  ).toBe(spf.policyId);
  expect(
    bytesToHex(
      assetInfoDatum.as_constr_plutus_data()?.fields().get(1).as_bytes()!,
    ),
  ).toBe(spf.nameBase16);
});

test('it should converts plutus data to assetInfoStructure', () => {
  const assetInfoDatumList = PlutusDataList.new();
  assetInfoDatumList.add(PlutusData.new_bytes(hexToBytes(spf.policyId)));
  assetInfoDatumList.add(PlutusData.new_bytes(hexToBytes(spf.nameBase16)));
  const datumDeserializeResult = AssetInfoDataType.deserialize(
    PlutusData.new_constr_plutus_data(
      ConstrPlutusData.new(0n, assetInfoDatumList),
    ),
  );

  expect(datumDeserializeResult).toBeInstanceOf(AssetInfo);
  expect(datumDeserializeResult.splashId).toBe(spf.splashId);
});
