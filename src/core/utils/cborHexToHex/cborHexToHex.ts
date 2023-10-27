import { decode } from 'cbor-x';

import { CborHexString, HexString } from '../../types/types.ts';
import { bytesToHex } from '../bytesToHex/bytesToHex.ts';
import { hexToBytes } from '../hexToBytes/hexToBytes.ts';

/**
 * Decodes cbor hex to hex representation
 * @param {CborHexString} cborHex
 * @returns {HexString}
 */
export const cborHexToHex = (cborHex: CborHexString): HexString =>
  bytesToHex(decode(hexToBytes(cborHex)));
