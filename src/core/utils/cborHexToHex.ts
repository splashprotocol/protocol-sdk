import { decode } from 'cbor-x';

import { CborHexString, HexString } from '../types/types';
import { bytesToHex } from './bytesToHex';
import { hexToBytes } from './hexToBytes';

export const cborHexToHex = (cborHex: CborHexString): HexString =>
  bytesToHex(decode(hexToBytes(cborHex)));
