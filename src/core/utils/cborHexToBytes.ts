import { decode } from 'cbor-x';

import { CborHexString } from '../types/types';
import { hexToBytes } from './hexToBytes';

export const cborHexToBytes = (cborHex: CborHexString): Uint8Array =>
  decode(hexToBytes(cborHex));
