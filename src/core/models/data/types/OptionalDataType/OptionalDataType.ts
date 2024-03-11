import {
  ConstrPlutusData,
  PlutusData,
  PlutusDataList,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { DataType, toDataType } from '../../common/DataType.ts';

/**
 * Optional data representation in datum
 * @example {"constructor":0,"fields":[{"int":1}?]} where {"int":1}? is optional
 * @param {DatumType<T>} datumType
 * @returns {DatumType<T | undefined>}
 * @constructor
 */
export const OptionalDataType = <T>(
  datumType: DataType<T>,
): DataType<T | undefined> => {
  return toDataType({
    serialize(value: T | undefined): PlutusData {
      const bf = PlutusDataList.new();
      if (value) {
        bf.add(datumType(value));
        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(0n, bf));
      } else {
        return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(1n, bf));
      }
    },
    deserialize(pd: PlutusData): T | undefined {
      const constr = pd.as_constr_plutus_data();
      if (constr) {
        return constr.alternative() === 0n
          ? datumType.deserialize(constr.fields().get(0))
          : undefined;
      } else {
        return undefined;
      }
    },
  });
};
