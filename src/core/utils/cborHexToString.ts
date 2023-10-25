import { decode } from 'cbor-x';

import { CborHexString } from '../types/types';
import { bytesToString } from './bytesToString';
import { hexToBytes } from './hexToBytes';

export const cborHexToString = (cborHex: CborHexString): string =>
  bytesToString(decode(hexToBytes(cborHex)));
