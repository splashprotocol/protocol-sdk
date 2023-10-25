import { encode } from 'cbor-x';

import { CborHexString } from '../types/types';
import { bytesToHex } from './bytesToHex';
import { stringToBytes } from './stringToBytes';

export const stringToCborHex = (str: string): CborHexString =>
  bytesToHex(encode(stringToBytes(str)));
