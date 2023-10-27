import { decode } from 'cbor-x';

import { CborHexString } from '../../types/types.ts';
import { bytesToString } from '../bytesToString/bytesToString.ts';
import { hexToBytes } from '../hexToBytes/hexToBytes.ts';

/**
 * Decodes cbor hex to string representation
 * @param {CborHexString} cborHex
 * @returns {string}
 */
export const cborHexToString = (cborHex: CborHexString): string =>
  bytesToString(decode(hexToBytes(cborHex)));
