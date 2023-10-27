import { CborHexString } from '../../types/types.ts';
import { hexToBytes } from '../hexToBytes/hexToBytes.ts';

/**
 * Converts cbor hex to cbor bytes representation
 * @param {CborHexString} cborHex
 * @returns {Uint8Array}
 */
export const cborHexToCborBytes = (cborHex: CborHexString): Uint8Array =>
  hexToBytes(cborHex);
