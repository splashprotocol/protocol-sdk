import {
  BigNum,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-browser';

import { bytesToHex } from '../../../../utils/bytesToHex/bytesToHex.ts';
import { hexToBytes } from '../../../../utils/hexToBytes/hexToBytes.ts';
import { AssetInfo } from '../../../assetInfo/AssetInfo.ts';
import { DatumType } from '../../common/DatumType.ts';

/**
 * Representation for assetInfo datum structure
 * @example  {"constructor":0,"fields":[{"bytes":"09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75"},{"bytes":"535046"}]}
 * @type {{serialize(value: AssetInfo): PlutusData, deserialize(pd: PlutusData): AssetInfo}}
 */
export const SpectrumAssetInfoDatumType: DatumType<AssetInfo> = {
  serialize(value: AssetInfo): PlutusData {
    const assetInfoPlutusList = PlutusList.new();
    assetInfoPlutusList.add(PlutusData.new_bytes(hexToBytes(value.policyId)));
    assetInfoPlutusList.add(PlutusData.new_bytes(hexToBytes(value.nameHex)));

    return PlutusData.new_constr_plutus_data(
      ConstrPlutusData.new(BigNum.zero(), assetInfoPlutusList),
    );
  },
  deserialize(pd: PlutusData): AssetInfo {
    const acPd = pd.as_constr_plutus_data()!.data();
    const policyId = bytesToHex(acPd.get(0).as_bytes()!);
    const hex = bytesToHex(acPd.get(1).as_bytes()!);

    return AssetInfo.fromNameHex(policyId, hex);
  },
};
