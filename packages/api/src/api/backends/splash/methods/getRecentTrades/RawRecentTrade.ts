import { price, ts } from '@splashprotocol/core';

export interface RawRecentTrade {
  readonly entityId: string;
  readonly price: price;
  readonly from: string;
  readonly to: string;
  readonly timestamp: ts;
  readonly side: 'buy' | 'sell';
}
