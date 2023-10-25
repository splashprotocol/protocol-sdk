import { encode } from 'cbor-x';

import { CborHexString, HexString } from '../types/types';
import { bytesToHex } from './bytesToHex';
import { hexToBytes } from './hexToBytes';

export const hexToCborHex = (hex: HexString): CborHexString =>
  bytesToHex(encode(hexToBytes(hex)));
