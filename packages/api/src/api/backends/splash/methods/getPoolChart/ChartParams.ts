import { PoolId, PoolType } from '@splashprotocol/core';
import { ChartInterval } from '../../../../../types/ChartInterval.ts';

export interface ChartParams {
  readonly interval: ChartInterval;
  readonly poolId: PoolId;
  readonly poolType: PoolType;
}
