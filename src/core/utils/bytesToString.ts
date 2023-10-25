import { encoder } from 'js-encoding-utils';

export const bytesToString = (bytes: Uint8Array): string =>
  encoder.arrayBufferToString(bytes);
