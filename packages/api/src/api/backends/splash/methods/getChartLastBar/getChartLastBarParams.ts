import { AssetInfo } from '@splashprotocol/core';
import { Resolution } from '../../../../../types/Resolution.ts';

export interface GetChartLastBarParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly resolution: Resolution;
}
