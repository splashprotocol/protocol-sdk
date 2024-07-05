import { AssetInfo } from '../../../models/assetInfo/AssetInfo.ts';
import { RawBar, Resolution } from '../common/RawBar.ts';

export interface GetChartLastBarParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly resolution: Resolution;
}

export type GetChartLastBarResult = RawBar;
