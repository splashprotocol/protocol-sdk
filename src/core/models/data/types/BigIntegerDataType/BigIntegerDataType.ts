import {
  BigInteger,
  PlutusData,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { DataType, toDataType } from '../../common/DataType.ts';

/**
 * Bigint data representation in datum
 * @example  {"int": <number>}
 * @type {{serialize(value: bigint): PlutusData, deserialize(pd: PlutusData): bigint}}
 */
export const BigIntegerDataType: DataType<bigint> = toDataType({
  serialize(value: bigint): PlutusData {
    return PlutusData.new_integer(BigInteger.from_str(value.toString()));
  },
  deserialize(pd: PlutusData): bigint {
    return BigInt(pd.as_integer()?.to_str()!);
  },
});
