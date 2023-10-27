import { encode } from 'cbor-x';

import { CborHexString } from '../types/types';
import { bytesToHex } from './bytesToHex';

export const bytesToCborHex = (bytes: Uint8Array): CborHexString =>
  bytesToHex(encode(bytes.buffer));
