import { encoder } from 'js-encoding-utils';
import { HexString } from '../../../types/HexString.ts';

export const stringToHex = (str: string): HexString =>
  encoder.arrayBufferToHexString(encoder.stringToArrayBuffer(str));
