import { PlutusData } from '@emurgo/cardano-serialization-lib-browser';

export interface DatumType<T> {
  serialize(value: T): PlutusData;

  deserialize(datum: PlutusData): T;
}
