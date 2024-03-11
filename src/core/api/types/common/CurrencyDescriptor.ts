import { AssetId } from '../../../types/types.ts';

export interface CurrencyDescriptor {
  readonly amount: string;
  readonly asset: AssetId;
}
