import { encoder } from 'js-encoding-utils';

import { HexString } from '../types/types';

export const bytesToHex = (bytes: Uint8Array): HexString =>
  encoder.arrayBufferToHexString(bytes);
