import { encode } from 'cbor-x';

import { CborHexString } from '../../types/types.ts';
import { bytesToHex } from '../bytesToHex/bytesToHex.ts';

/**
 * Encodes bytes array to cbor hex string
 * @param {Uint8Array} bytes
 * @returns {CborHexString}
 */
export const bytesToCborHex = (bytes: Uint8Array): CborHexString =>
  bytesToHex(encode(bytes.buffer));
