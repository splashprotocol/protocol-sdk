import { Bech32String } from '../../../../types/Bech32String.ts';
import { isValidBech32 } from '../helpers/isValidBech32/isValidBech32.ts';

export const assertBech32 = (bech32Str: Bech32String) => {
  if (!isValidBech32(bech32Str)) {
    throw new Error(`Invalid bech32 string: ${bech32Str}`);
  }
};
