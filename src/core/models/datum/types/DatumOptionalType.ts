import {
  BigNum,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-browser';

import { DatumType } from '../common/DatumType';

export const DatumOptionalType = <T>(
  datumType: DatumType<T>,
): DatumType<T | undefined> => {
  return {
    serialize(value: T | undefined): PlutusData {
      const bf = PlutusList.new();
      if (value) {
        bf.add(datumType.serialize(value));
        return PlutusData.new_constr_plutus_data(
          ConstrPlutusData.new(BigNum.zero(), bf),
        );
      } else {
        return PlutusData.new_constr_plutus_data(
          ConstrPlutusData.new(BigNum.from_str('1'), bf),
        );
      }
    },
    deserialize(pd: PlutusData): T | undefined {
      const constr = pd.as_constr_plutus_data();
      if (constr) {
        return constr.alternative().is_zero()
          ? datumType.deserialize(constr.data().get(0))
          : undefined;
      } else {
        return undefined;
      }
    },
  };
};
