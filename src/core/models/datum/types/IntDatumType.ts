import {
  BigInt as WasmBigInt,
  PlutusData,
} from '@emurgo/cardano-serialization-lib-browser';

import { DatumType } from '../common/DatumType';

export const IntDatumType: DatumType<number> = {
  serialize(value: number): PlutusData {
    return PlutusData.new_integer(WasmBigInt.from_str(value.toString()));
  },
  deserialize(pd: PlutusData): number {
    return Number(pd.as_integer()?.to_str()!);
  },
};
