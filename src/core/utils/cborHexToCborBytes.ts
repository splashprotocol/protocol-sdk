import { CborHexString } from '../types/types';
import { hexToBytes } from './hexToBytes';

export const cborHexToCborBytes = (cborHex: CborHexString): Uint8Array =>
  hexToBytes(cborHex);
