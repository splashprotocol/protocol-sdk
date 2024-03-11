import { PlutusData } from '@dcspark/cardano-multiplatform-lib-browser';

export type DataType<T> = ((value: T) => PlutusData) & {
  deserialize(datum: PlutusData): T;
};

export const toDataType = <T>(descriptor: {
  serialize: (value: T) => PlutusData;
  deserialize: (raw: PlutusData) => T;
}): DataType<T> => {
  //@ts-ignore
  const dataType: DataType<T> = descriptor.serialize;
  dataType.deserialize = descriptor.deserialize;

  return dataType;
};
