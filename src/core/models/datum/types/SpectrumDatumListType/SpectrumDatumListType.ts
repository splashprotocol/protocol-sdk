import {
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-browser';

import { DatumType } from '../../common/DatumType.ts';

export const SpectrumDatumListType = <T>(
  datumType: DatumType<T>,
): DatumType<T[]> => {
  return {
    serialize(value: T[]): PlutusData {
      const plutusList = PlutusList.new();
      value.forEach((item) => plutusList.add(datumType.serialize(item)));

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
  };
};
