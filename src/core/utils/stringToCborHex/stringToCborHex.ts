import { encode } from 'cbor-x';

import { CborHexString } from '../../types/types.ts';
import { bytesToHex } from '../bytesToHex/bytesToHex.ts';
import { stringToBytes } from '../stringToBytes/stringToBytes.ts';

/**
 * Encodes string to cbor hex
 * @param {string} str
 * @returns {CborHexString}
 */
export const stringToCborHex = (str: string): CborHexString =>
  bytesToHex(encode(stringToBytes(str).buffer));
