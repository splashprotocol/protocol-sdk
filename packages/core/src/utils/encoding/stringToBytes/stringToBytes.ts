import { encoder } from 'js-encoding-utils';

/**
 * Converts string to bytes representation
 * @param {string} str
 * @returns {Uint8Array}
 */
export const stringToBytes = (str: string): Uint8Array =>
  encoder.stringToArrayBuffer(str);
