import { PoolType } from '../../../types/Pool.ts';
import { PoolId } from '../../../types/types.ts';
import { ChartInterval } from './ChartInterval.ts';

export interface ChartParams {
  readonly interval: ChartInterval;
  readonly poolId: PoolId;
  readonly poolType: PoolType;
}
