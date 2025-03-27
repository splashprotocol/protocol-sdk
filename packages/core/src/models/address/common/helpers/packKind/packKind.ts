import { AddressKind } from '../../types/AddressKind.ts';

export const packKind = (kind: AddressKind): number => kind << 4;
