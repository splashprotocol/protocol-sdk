import { PoolId } from '../../../types/types.ts';
import { ChartInterval } from './ChartInterval.ts';

export interface ChartParams {
  interval: ChartInterval;
  readonly poolId: PoolId;
}
