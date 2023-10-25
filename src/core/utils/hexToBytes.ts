import { encoder } from 'js-encoding-utils';

import { HexString } from '../types/types';

export const hexToBytes = (hex: HexString): Uint8Array =>
  encoder.hexStringToArrayBuffer(hex);
