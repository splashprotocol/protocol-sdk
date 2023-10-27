import { encode } from 'cbor-x';

import { HexString } from '../../types/types.ts';
import { hexToBytes } from '../hexToBytes/hexToBytes.ts';

/**
 * Encodes hex to cbor bytes
 * @param {HexString} hex
 * @returns {Uint8Array}
 */
export const hexToCborBytes = (hex: HexString): Uint8Array =>
  encode(hexToBytes(hex).buffer);
