import { PoolChartPoint } from '../../../../../types/PoolChartPoint.ts';
import { AssetInfo } from '@splashprotocol/core';

export interface GetPoolChartResult {
  asset: AssetInfo;
  data: PoolChartPoint[];
}
