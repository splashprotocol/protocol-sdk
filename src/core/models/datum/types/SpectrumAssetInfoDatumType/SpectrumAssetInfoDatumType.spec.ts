import {
  BigNum,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-browser';

import { bytesToHex } from '../../../../utils/bytesToHex/bytesToHex.ts';
import { hexToBytes } from '../../../../utils/hexToBytes/hexToBytes.ts';
import { AssetInfo } from '../../../assetInfo/AssetInfo.ts';
import { spfAssetInfo } from '../../../assetInfo/spfAssetInfo.ts';
import { SpectrumAssetInfoDatumType } from './SpectrumAssetInfoDatumType.ts';

test('it should converts assetInfo to plutus data', () => {
  const assetInfoDatum = SpectrumAssetInfoDatumType.serialize(spfAssetInfo);
  expect(assetInfoDatum).toBeInstanceOf(PlutusData);
  expect(
    bytesToHex(
      assetInfoDatum.as_constr_plutus_data()?.data().get(0).as_bytes()!,
    ),
  ).toBe(spfAssetInfo.policyId);
  expect(
    bytesToHex(
      assetInfoDatum.as_constr_plutus_data()?.data().get(1).as_bytes()!,
    ),
  ).toBe(spfAssetInfo.nameHex);
});

test('it should converts plutus data to assetInfoStructure', () => {
  const assetInfoDatumList = PlutusList.new();
  assetInfoDatumList.add(
    PlutusData.new_bytes(hexToBytes(spfAssetInfo.policyId)),
  );
  assetInfoDatumList.add(
    PlutusData.new_bytes(hexToBytes(spfAssetInfo.nameHex)),
  );
  const datumDeserializeResult = SpectrumAssetInfoDatumType.deserialize(
    PlutusData.new_constr_plutus_data(
      ConstrPlutusData.new(BigNum.zero(), assetInfoDatumList),
    ),
  );

  expect(datumDeserializeResult).toBeInstanceOf(AssetInfo);
  expect(datumDeserializeResult.spectrumId).toBe(spfAssetInfo.spectrumId);
});
