import { AssetInfo, Currency, percent, PoolId } from '@splashprotocol/core';

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
