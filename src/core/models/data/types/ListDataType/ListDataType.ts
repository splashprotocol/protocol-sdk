import {
  PlutusData,
  PlutusDataList,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { DataType, toDataType } from '../../common/DataType.ts';

export const ListDataType = <T>(datumType: DataType<T>): DataType<T[]> => {
  return toDataType({
    serialize(value: T[]): PlutusData {
      const plutusList = PlutusDataList.new();
      value.forEach((item) => plutusList.add(datumType(item)));

      return PlutusData.new_list(plutusList);
    },
    deserialize(datum: PlutusData): T[] {
      const plutusList = datum.as_list();

      if (!plutusList) {
        throw new Error('plutus data doesn`t contain list');
      }

      const res: T[] = [];
      for (let i = 0; i < plutusList.len(); i++) {
        res.push(datumType.deserialize(plutusList.get(i)));
      }

      return res;
    },
  });
};
