import { encoder } from 'js-encoding-utils';

/**
 * Converts bytes to string representation
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export const bytesToString = (bytes: Uint8Array): string =>
  encoder.arrayBufferToString(bytes);
