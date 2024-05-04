import {
  ConstrPlutusData,
  PlutusData,
  PlutusDataList,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { DataType, toDataType } from '../../common/DataType.ts';
import { SerializationError } from '../../common/SerializationError.ts';

export function TupleDataType<T1 extends DataType<any>>(
  types: [T1],
): DataType<[T1 extends DataType<infer R1> ? R1 : never]>;
export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
>(
  types: [T1, T2],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
  ]
>;
export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
  T3 extends DataType<any>,
>(
  types: [T1, T2, T3],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
    T3 extends DataType<infer R3> ? R3 : never,
  ]
>;
export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
  T3 extends DataType<any>,
  T4 extends DataType<any>,
>(
  types: [T1, T2, T3, T4],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
    T3 extends DataType<infer R3> ? R3 : never,
    T4 extends DataType<infer R4> ? R4 : never,
  ]
>;
export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
  T3 extends DataType<any>,
  T4 extends DataType<any>,
  T5 extends DataType<any>,
>(
  types: [T1, T2, T3, T4, T5],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
    T3 extends DataType<infer R3> ? R3 : never,
    T4 extends DataType<infer R4> ? R4 : never,
    T5 extends DataType<infer R5> ? R5 : never,
  ]
>;
export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
  T3 extends DataType<any>,
  T4 extends DataType<any>,
  T5 extends DataType<any>,
  T6 extends DataType<any>,
>(
  types: [T1, T2, T3, T4, T5, T6],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
    T3 extends DataType<infer R3> ? R3 : never,
    T4 extends DataType<infer R4> ? R4 : never,
    T5 extends DataType<infer R5> ? R5 : never,
    T6 extends DataType<infer R6> ? R6 : never,
  ]
>;
export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
  T3 extends DataType<any>,
  T4 extends DataType<any>,
  T5 extends DataType<any>,
  T6 extends DataType<any>,
  T7 extends DataType<any>,
>(
  types: [T1, T2, T3, T4, T5, T6, T7],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
    T3 extends DataType<infer R3> ? R3 : never,
    T4 extends DataType<infer R4> ? R4 : never,
    T5 extends DataType<infer R5> ? R5 : never,
    T6 extends DataType<infer R6> ? R6 : never,
    T7 extends DataType<infer R7> ? R7 : never,
  ]
>;
export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
  T3 extends DataType<any>,
  T4 extends DataType<any>,
  T5 extends DataType<any>,
  T6 extends DataType<any>,
  T7 extends DataType<any>,
  T8 extends DataType<any>,
>(
  types: [T1, T2, T3, T4, T5, T6, T7, T8],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
    T3 extends DataType<infer R3> ? R3 : never,
    T4 extends DataType<infer R4> ? R4 : never,
    T5 extends DataType<infer R5> ? R5 : never,
    T6 extends DataType<infer R6> ? R6 : never,
    T7 extends DataType<infer R7> ? R7 : never,
    T8 extends DataType<infer R8> ? R8 : never,
  ]
>;
export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
  T3 extends DataType<any>,
  T4 extends DataType<any>,
  T5 extends DataType<any>,
  T6 extends DataType<any>,
  T7 extends DataType<any>,
  T8 extends DataType<any>,
  T9 extends DataType<any>,
>(
  types: [T1, T2, T3, T4, T5, T6, T7, T8, T9],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
    T3 extends DataType<infer R3> ? R3 : never,
    T4 extends DataType<infer R4> ? R4 : never,
    T5 extends DataType<infer R5> ? R5 : never,
    T6 extends DataType<infer R6> ? R6 : never,
    T7 extends DataType<infer R7> ? R7 : never,
    T8 extends DataType<infer R8> ? R8 : never,
    T9 extends DataType<infer R9> ? R9 : never,
  ]
>;

export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
  T3 extends DataType<any>,
  T4 extends DataType<any>,
  T5 extends DataType<any>,
  T6 extends DataType<any>,
  T7 extends DataType<any>,
  T8 extends DataType<any>,
  T9 extends DataType<any>,
  T10 extends DataType<any>,
>(
  types: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
    T3 extends DataType<infer R3> ? R3 : never,
    T4 extends DataType<infer R4> ? R4 : never,
    T5 extends DataType<infer R5> ? R5 : never,
    T6 extends DataType<infer R6> ? R6 : never,
    T7 extends DataType<infer R7> ? R7 : never,
    T8 extends DataType<infer R8> ? R8 : never,
    T9 extends DataType<infer R9> ? R9 : never,
    T10 extends DataType<infer R10> ? R10 : never,
  ]
>;

export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
  T3 extends DataType<any>,
  T4 extends DataType<any>,
  T5 extends DataType<any>,
  T6 extends DataType<any>,
  T7 extends DataType<any>,
  T8 extends DataType<any>,
  T9 extends DataType<any>,
  T10 extends DataType<any>,
  T11 extends DataType<any>,
>(
  types: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
    T3 extends DataType<infer R3> ? R3 : never,
    T4 extends DataType<infer R4> ? R4 : never,
    T5 extends DataType<infer R5> ? R5 : never,
    T6 extends DataType<infer R6> ? R6 : never,
    T7 extends DataType<infer R7> ? R7 : never,
    T8 extends DataType<infer R8> ? R8 : never,
    T9 extends DataType<infer R9> ? R9 : never,
    T10 extends DataType<infer R10> ? R10 : never,
    T11 extends DataType<infer R11> ? R11 : never,
  ]
>;

export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
  T3 extends DataType<any>,
  T4 extends DataType<any>,
  T5 extends DataType<any>,
  T6 extends DataType<any>,
  T7 extends DataType<any>,
  T8 extends DataType<any>,
  T9 extends DataType<any>,
  T10 extends DataType<any>,
  T11 extends DataType<any>,
  T12 extends DataType<any>,
>(
  types: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
    T3 extends DataType<infer R3> ? R3 : never,
    T4 extends DataType<infer R4> ? R4 : never,
    T5 extends DataType<infer R5> ? R5 : never,
    T6 extends DataType<infer R6> ? R6 : never,
    T7 extends DataType<infer R7> ? R7 : never,
    T8 extends DataType<infer R8> ? R8 : never,
    T9 extends DataType<infer R9> ? R9 : never,
    T10 extends DataType<infer R10> ? R10 : never,
    T11 extends DataType<infer R11> ? R11 : never,
    T12 extends DataType<infer R12> ? R12 : never,
  ]
>;

export function TupleDataType<
  T1 extends DataType<any>,
  T2 extends DataType<any>,
  T3 extends DataType<any>,
  T4 extends DataType<any>,
  T5 extends DataType<any>,
  T6 extends DataType<any>,
  T7 extends DataType<any>,
  T8 extends DataType<any>,
  T9 extends DataType<any>,
  T10 extends DataType<any>,
  T11 extends DataType<any>,
  T12 extends DataType<any>,
  T13 extends DataType<any>,
>(
  types: [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13],
): DataType<
  [
    T1 extends DataType<infer R1> ? R1 : never,
    T2 extends DataType<infer R2> ? R2 : never,
    T3 extends DataType<infer R3> ? R3 : never,
    T4 extends DataType<infer R4> ? R4 : never,
    T5 extends DataType<infer R5> ? R5 : never,
    T6 extends DataType<infer R6> ? R6 : never,
    T7 extends DataType<infer R7> ? R7 : never,
    T8 extends DataType<infer R8> ? R8 : never,
    T9 extends DataType<infer R9> ? R9 : never,
    T10 extends DataType<infer R10> ? R10 : never,
    T11 extends DataType<infer R11> ? R11 : never,
    T12 extends DataType<infer R12> ? R12 : never,
    T13 extends DataType<infer R13> ? R13 : never,
  ]
>;

/**
 * Tuple representation in plutus data
 * @param {DataType<any>[]} typeList
 * @returns {DataType<any>}
 * @constructor
 */
export function TupleDataType(typeList: DataType<any>[]): DataType<any> {
  return toDataType({
    serialize(value: any[]) {
      if (typeList.length !== value.length) {
        throw new SerializationError('data length is invalid');
      }

      const pl = PlutusDataList.new();

      for (let i = 0; i < value.length; i++) {
        pl.add(typeList[i](value[i]));
      }

      return PlutusData.new_constr_plutus_data(ConstrPlutusData.new(0n, pl));
    },
    deserialize(data: PlutusData): any[] {
      const pl = data.as_constr_plutus_data()?.fields();

      if (!pl) {
        throw new Error('empty tuple');
      }

      const res: any[] = [];

      for (let i = 0; i < pl.len(); i++) {
        res.push(typeList[i].deserialize(pl.get(i)));
      }

      return res;
    },
  });
}
