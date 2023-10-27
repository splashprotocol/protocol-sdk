import { encode } from 'cbor-x';

import { CborHexString, HexString } from '../../types/types.ts';
import { bytesToHex } from '../bytesToHex/bytesToHex.ts';
import { hexToBytes } from '../hexToBytes/hexToBytes.ts';

/**
 * Encodes hex to cbor hex
 * @param {HexString} hex
 * @returns {CborHexString}
 */
export const hexToCborHex = (hex: HexString): CborHexString =>
  bytesToHex(encode(hexToBytes(hex).buffer));
