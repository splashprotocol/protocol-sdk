import { AssetInfoDataType } from './types/AssetInfoDataType/AssetInfoDataType.ts';
import { BigIntegerDataType } from './types/BigIntegerDataType/BigIntegerDataType.ts';
import { BytesDataType } from './types/BytesDataType/BytesDataType.ts';
import { IntegerDataType } from './types/IntegerDataType/IntegerDataType.ts';
import { ListDataType } from './types/ListDataType/ListDataType.ts';
import { OptionalDataType } from './types/OptionalDataType/OptionalDataType.ts';
import { TupleDataType } from './types/TupleDataType/TupleDataType.ts';

/**
 * Plutus data representation
 */
export const Data = {
  AssetInfo: AssetInfoDataType,
  BigInt: BigIntegerDataType,
  Int: IntegerDataType,
  List: ListDataType,
  Optional: OptionalDataType,
  Bytes: BytesDataType,
  Tuple: TupleDataType,
};
