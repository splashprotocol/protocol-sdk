import { encoder } from 'js-encoding-utils';

import { HexString } from '../../types/types.ts';

/**
 * Converts hex to bytes representation
 * @param {HexString} hex
 * @returns {Uint8Array}
 */
export const hexToBytes = (hex: HexString): Uint8Array =>
  encoder.hexStringToArrayBuffer(hex);
