import { AssetInfo, ts } from '@splashprotocol/core';
import { Resolution } from '../../../../../types/Resolution.ts';

export interface GetChartHistoryParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly from: ts;
  readonly to: ts;
  readonly resolution: Resolution;
}
