import { AssetId, PoolId } from '../../../types/types.ts';

export interface RawTrendPool {
  readonly poolId: PoolId;
  readonly x: AssetId;
  readonly y: AssetId;
  readonly tvlAda: number;
  readonly tvlUsd: number;
  readonly volumeAda: number;
  readonly volumeUsd: number;
  readonly apr: number;
  readonly aprTrend: number;
}
