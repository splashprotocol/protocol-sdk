import { RecentTrade } from '../../../../../types/RecentTrade.ts';
import { uint } from '@splashprotocol/core';

export interface GetRecentTradesResult {
  readonly data: RecentTrade[];
  readonly count: uint;
}
