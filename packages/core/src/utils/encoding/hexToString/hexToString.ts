import { encoder } from 'js-encoding-utils';
import { HexString } from '../../../types/HexString.ts';

/**
 * Converts hex to string representation
 * @param {HexString} hex
 * @returns {string}
 */
export const hexToString = (hex: HexString): string =>
  encoder.arrayBufferToString(encoder.hexStringToArrayBuffer(hex));
