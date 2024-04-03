import { PlutusData } from '@dcspark/cardano-multiplatform-lib-browser';

import { DataType } from '../../../../../../build';
import {
  numberToRational,
  rationalToNumber,
} from '../../../../utils/math/math.ts';
import { toDataType } from '../../common/DataType.ts';
import { BigIntegerDataType } from '../BigIntegerDataType/BigIntegerDataType.ts';
import { TupleDataType } from '../TupleDataType/TupleDataType.ts';

const RationalTuple = TupleDataType([BigIntegerDataType, BigIntegerDataType]);

/**
 * Bigint data representation in datum
 * @example  { fields: [{ "int": <number> }, { "int": <number> }] }
 * @type {{serialize(value: bigint): PlutusData, deserialize(pd: PlutusData): bigint}}
 */
export const RationalDataType: DataType<number> = toDataType({
  serialize(value: number): PlutusData {
    const rational = numberToRational(value);

    return RationalTuple([rational.numerator, rational.denominator]);
  },
  deserialize(data: PlutusData): number {
    const [numerator, denominator] = RationalTuple.deserialize(data);

    return rationalToNumber({
      numerator,
      denominator,
    });
  },
});
