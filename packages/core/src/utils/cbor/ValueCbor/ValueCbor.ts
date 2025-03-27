import * as Cbor from 'cbor-web';
import { CborHexString } from '../../../types/CborHexString.ts';

export type ValueEncodeObject =
  | [bigint | number, Map<Uint8Array, Map<Uint8Array, number | bigint>> | {}]
  | bigint
  | number;

export const ValueCbor = {
  decodeCborBytesToObject: (
    arrayLike: Buffer | Uint8Array,
  ): ValueEncodeObject => {
    return Cbor.decode(arrayLike);
  },

  decodeCborHexToObject: (cbor: CborHexString): ValueEncodeObject => {
    return Cbor.decode(cbor);
  },
};
