import {
  BigInt as WasmBigInt,
  PlutusData,
} from '@emurgo/cardano-serialization-lib-browser';

import { DatumType } from '../../common/DatumType.ts';

/**
 * Bigint data representation in datum
 * @example  {"int": <number>}
 * @type {{serialize(value: bigint): PlutusData, deserialize(pd: PlutusData): bigint}}
 */
export const SpectrumIntDatumType: DatumType<number> = {
  serialize(value: number): PlutusData {
    return PlutusData.new_integer(WasmBigInt.from_str(value.toString()));
  },
  deserialize(pd: PlutusData): number {
    return Number(pd.as_integer()?.to_str()!);
  },
};
