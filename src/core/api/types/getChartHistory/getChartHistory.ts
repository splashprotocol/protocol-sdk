import { AssetInfo } from '../../../models/assetInfo/AssetInfo.ts';
import { ts } from '../../../types/types.ts';
import { RawBar, Resolution } from '../common/RawBar.ts';

export interface GetChartHistoryParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly from: ts;
  readonly to: ts;
  readonly resolution: Resolution;
}

export type GetChartHistoryResult = RawBar[];
