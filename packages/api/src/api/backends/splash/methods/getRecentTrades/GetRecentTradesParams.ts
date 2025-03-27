import { AssetInfo, uint } from '@splashprotocol/core';

export interface GetRecentTradesParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly limit: uint;
  readonly offset: uint;
}
