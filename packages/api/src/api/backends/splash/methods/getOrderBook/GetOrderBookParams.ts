import { AssetInfo } from '@splashprotocol/core';

export interface GetOrderBookParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
}
