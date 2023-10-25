import {
  BigInt as WasmBigInt,
  PlutusData,
} from '@emurgo/cardano-serialization-lib-browser';

import { DatumType } from '../common/DatumType';

export const BigIntDatumType: DatumType<bigint> = {
  serialize(value: bigint): PlutusData {
    return PlutusData.new_integer(WasmBigInt.from_str(value.toString()));
  },
  deserialize(pd: PlutusData): bigint {
    return BigInt(pd.as_integer()?.to_str()!);
  },
};
