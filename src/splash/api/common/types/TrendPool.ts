import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { percent, PoolId } from '../../../../core/types/types.ts';

export interface TrendPool {
  readonly poolId: PoolId;
  readonly x: AssetInfo;
  readonly y: AssetInfo;
  readonly tvlAda: Currency;
  readonly tvlUsd: Currency;
  readonly volumeAda: Currency;
  readonly volumeUsd: Currency;
  readonly apr: percent;
  readonly aprTrend: percent;
}
