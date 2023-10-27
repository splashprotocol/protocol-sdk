import { encode } from 'cbor-x';

import { HexString } from '../types/types';
import { hexToBytes } from './hexToBytes';

export const hexToCborBytes = (hex: HexString): Uint8Array =>
  encode(hexToBytes(hex).buffer);
