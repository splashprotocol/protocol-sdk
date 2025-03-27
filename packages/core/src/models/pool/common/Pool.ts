import { AssetInfo } from '../../assetInfo/AssetInfo.ts';
import { Currency } from '../../currency/Currency.ts';
import { PoolId } from '../../../types/PoolId.ts';
import { Dictionary } from '../../../types/Dictionary.ts';
import { OutputReference } from '../../../types/OutputReference.ts';

export type PoolType = 'cfmm' | 'weighted' | 'stable';

export interface Pool<T extends PoolType, A extends Dictionary<Currency>> {
  readonly id: PoolId;
  readonly nft: AssetInfo;
  readonly lq: Currency;
  readonly type: T;
  readonly convertLpToAssets: (lq: Currency) => A;
  readonly convertAssetsToLp: (assets: A) => Currency;
  readonly outputId: OutputReference;
}
