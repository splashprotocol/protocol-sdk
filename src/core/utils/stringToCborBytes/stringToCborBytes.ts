import { encode } from 'cbor-x';

import { stringToBytes } from '../stringToBytes/stringToBytes.ts';

/**
 * Encodes string to cbor bytes
 * @param {string} str
 * @returns {Uint8Array}
 */
export const stringToCborBytes = (str: string): Uint8Array =>
  encode(stringToBytes(str).buffer);
