import { encode } from 'cbor-x';

export const bytesToCborBytes = (bytes: Uint8Array): Uint8Array =>
  encode(bytes.buffer);
