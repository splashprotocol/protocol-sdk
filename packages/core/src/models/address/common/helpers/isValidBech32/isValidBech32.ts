import { bech32 } from 'bech32';
import { BECH32_LIMIT } from '../../constants/bech32Limit.ts';

export const isValidBech32 = (bech32Str: string): boolean => {
  try {
    bech32.fromWords(bech32.decode(bech32Str, BECH32_LIMIT).words);
    return true;
  } catch {
    return false;
  }
};
