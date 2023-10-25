import { encoder } from 'js-encoding-utils';

export const stringToBytes = (str: string): Uint8Array =>
  encoder.stringToArrayBuffer(str);
