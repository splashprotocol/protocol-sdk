import { decode } from 'cbor-x';

import { CborHexString } from '../../types/types.ts';
import { hexToBytes } from '../hexToBytes/hexToBytes.ts';

/**
 * Decodes cbor hex to bytes
 * @param {CborHexString} cborHex
 * @returns {Uint8Array}
 */
export const cborHexToBytes = (cborHex: CborHexString): Uint8Array =>
  decode(hexToBytes(cborHex));
