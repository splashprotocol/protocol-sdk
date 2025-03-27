import { AddressKind } from '../../types/AddressKind.ts';

export const unpackKind = (bytes: Uint8Array): AddressKind => bytes[0] >> 4;
