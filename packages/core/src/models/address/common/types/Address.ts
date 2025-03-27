import { Bech32String } from '../../../../types/Bech32String.ts';
import { HexString } from '../../../../types/HexString.ts';

export interface Address {
  toBech32(): Bech32String;

  toHex(): HexString;
}
