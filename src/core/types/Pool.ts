import { AssetInfo } from '../models/assetInfo/AssetInfo.ts';
import { Currency } from '../models/currency/Currency.ts';
import { PoolId } from './types.ts';

export type PoolType = 'cfmm' | 'weight';

export interface Pool<T extends PoolType> {
  readonly id: PoolId;
  readonly nft: AssetInfo;
  readonly lq: Currency;
  readonly type: T;
}
