import {
  ConstrPlutusData,
  PlutusData,
  PlutusDataList,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { HexString } from '../../../../types/types';
import { toDataType } from '../../common/DataType';
import { BytesDataType } from '../BytesDataType/BytesDataType';
import { TupleDataType } from '../TupleDataType/TupleDataType.ts';

export interface DaoPolicyParams {
  readonly hash: HexString;
  readonly type: 'scriptCredential' | 'verificationKeyCredential';
}

const DaoPolicyInlineDataType = toDataType<DaoPolicyParams>({
  serialize: ({ hash, type }) => {
    const pdList = PlutusDataList.new();
    pdList.add(BytesDataType(hash));

    const constrPlutusData =
      type === 'scriptCredential'
        ? ConstrPlutusData.new(1n, pdList)
        : ConstrPlutusData.new(0n, pdList);

    return PlutusData.new_constr_plutus_data(constrPlutusData);
  },
  deserialize: (data: PlutusData) => {
    const constrPlutusData = data.as_constr_plutus_data();

    if (!constrPlutusData) {
      throw new Error('invalid dao policy data');
    }

    if (constrPlutusData.fields().get(0)) {
      return {
        type: 'verificationKeyCredential',
        hash: BytesDataType.deserialize(
          constrPlutusData.fields().get(0).as_list()?.get(0)!,
        ),
      };
    } else {
      return {
        type: 'scriptCredential',
        hash: BytesDataType.deserialize(
          constrPlutusData.fields().get(1).as_list()?.get(0)!,
        ),
      };
    }
  },
});

export const DaoPolicyDataType = TupleDataType([DaoPolicyInlineDataType]);
