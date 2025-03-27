import { AssetId } from '@splashprotocol/core';

export interface CurrencyDescriptor {
  readonly amount: string;
  readonly asset: AssetId;
}
