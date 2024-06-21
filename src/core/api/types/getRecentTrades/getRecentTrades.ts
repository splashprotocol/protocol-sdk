import { AssetInfo } from '../../../models/assetInfo/AssetInfo.ts';
import { uint } from '../../../types/types.ts';
import { RawRecentTrade } from '../common/RawRecentTrade.ts';

export interface GetRecentTradesParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly limit: uint;
  readonly offset: uint;
}

export interface GetRecentTradesResult {
  readonly data: RawRecentTrade[];
  readonly count: uint;
}
