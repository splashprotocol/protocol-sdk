import { encoder } from 'js-encoding-utils';

import { HexString } from '../../types/types.ts';

/**
 * Converts bytes to hex string representation
 * @param {Uint8Array} bytes
 * @returns {HexString}
 */
export const bytesToHex = (bytes: Uint8Array): HexString =>
  encoder.arrayBufferToHexString(bytes);
