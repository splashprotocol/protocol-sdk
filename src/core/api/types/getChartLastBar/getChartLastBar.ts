import { AssetInfo } from '../../../models/assetInfo/AssetInfo.ts';
import { Bar, Resolution } from '../common/Bar.ts';

export interface GetChartLastBarParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly resolution: Resolution;
}

export type GetChartLastBarResult = Bar;
