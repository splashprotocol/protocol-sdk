import { encode } from 'cbor-x';

/**
 * Encodes bytes array to cbor bytes
 * @param {Uint8Array} bytes
 * @returns {Uint8Array}
 */
export const bytesToCborBytes = (bytes: Uint8Array): Uint8Array =>
  encode(bytes.buffer);
