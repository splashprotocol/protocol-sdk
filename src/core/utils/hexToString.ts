import { encoder } from 'js-encoding-utils';

import { HexString } from '../types/types';

export const hexToString = (hex: HexString): string =>
  encoder.arrayBufferToString(encoder.hexStringToArrayBuffer(hex));
