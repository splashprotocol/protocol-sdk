import { PlutusData } from '@dcspark/cardano-multiplatform-lib-browser';

import { DeserializationError } from './DeserializationError.ts';
import { SerializationError } from './SerializationError.ts';

export type DataType<T> = ((value: T) => PlutusData) & {
  deserialize(datum: PlutusData | string): T;
};

export const toDataType = <T>(descriptor: {
  serialize: (value: T) => PlutusData;
  deserialize: (raw: PlutusData) => T;
}): DataType<T> => {
  //@ts-ignore
  const dataType: DataType<T> = (value: T) => {
    try {
      return descriptor.serialize(value);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : err;
      throw new SerializationError(
        `${message as any}. Value: ${JSON.stringify(value)}`,
      );
    }
  };
  dataType.deserialize = (raw: PlutusData | string) => {
    try {
      const pd =
        raw instanceof PlutusData ? raw : PlutusData.from_cbor_hex(raw);
      return descriptor.deserialize(pd);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : err;
      throw new DeserializationError(
        `${message as any}. Data: ${
          raw instanceof PlutusData ? raw.as_constr_plutus_data() : raw
        }`,
      );
    }
  };

  return dataType;
};
