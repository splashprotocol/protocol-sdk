import { encode } from 'cbor-x';

import { stringToBytes } from './stringToBytes';

export const stringToCborBytes = (str: string): Uint8Array =>
  encode(stringToBytes(str));
