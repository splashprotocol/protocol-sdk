import { AssetId, PoolId } from '@splashprotocol/core';

export interface RawTrendPool {
  readonly poolId: PoolId;
  readonly x: AssetId;
  readonly y: AssetId;
  readonly tvlAda: string;
  readonly tvlUsd: string;
  readonly volumeAda: string;
  readonly volumeUsd: string;
  readonly apr: number;
  readonly aprTrend: number;
}
