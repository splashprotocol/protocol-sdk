// @ts-ignore
import { decode, encode } from 'cbor2';

import { CborHexString } from '../../../../../core/types/types.ts';
import { bytesToHex } from '../../../../../core/utils/bytesToHex/bytesToHex.ts';

export const getPrependData = (signature: CborHexString): CborHexString => {
  const decodedSignature = decode(signature);

  const message = decodedSignature[2];
  const protectedHeaders = decodedSignature[0];

  return bytesToHex(
    encode(['Signature1', protectedHeaders, Uint8Array.from([]), message]),
  ).split(bytesToHex(message))[0];
};
