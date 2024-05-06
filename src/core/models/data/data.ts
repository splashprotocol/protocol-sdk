import { AddressDataType } from './types/AddressDataType/AddressDataType.ts';
import { AssetInfoDataType } from './types/AssetInfoDataType/AssetInfoDataType.ts';
import { BigIntegerDataType } from './types/BigIntegerDataType/BigIntegerDataType.ts';
import { BytesDataType } from './types/BytesDataType/BytesDataType.ts';
import { DaoPolicyDataType } from './types/DaoPolicyDataType/DaoPolicyDataType.ts';
import { IntegerDataType } from './types/IntegerDataType/IntegerDataType.ts';
import { ListDataType } from './types/ListDataType/ListDataType.ts';
import { OptionalDataType } from './types/OptionalDataType/OptionalDataType.ts';
import { RationalDataType } from './types/RationalDataType/RationalDataType.ts';
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
  Address: AddressDataType,
  Bytes: BytesDataType,
  Rational: RationalDataType,
  Tuple: TupleDataType,
  DaoPolicy: DaoPolicyDataType,
};
