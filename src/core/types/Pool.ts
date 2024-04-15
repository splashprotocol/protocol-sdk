import { AssetInfo } from '../models/assetInfo/AssetInfo.ts';
import { Currency } from '../models/currency/Currency.ts';
import { Dictionary, PoolId } from './types.ts';

export type PoolType = 'cfmm' | 'weighted';

export interface Pool<T extends PoolType, A extends Dictionary<Currency>> {
  readonly id: PoolId;
  readonly nft: AssetInfo;
  readonly lq: Currency;
  readonly type: T;
  readonly deposit: (...args: any) => Promise<any>;
  readonly convertLpToAssets: (lq: Currency) => A;
  readonly convertAssetsToLp: (assets: A) => Currency;
}
