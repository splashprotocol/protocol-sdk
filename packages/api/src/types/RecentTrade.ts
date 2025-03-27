import { Currency, lts, Price } from '@splashprotocol/core';

export interface RecentTrade {
  readonly id: string;
  readonly from: Currency;
  readonly to: Currency;
  readonly price: Price;
  readonly timestamp: lts;
  readonly side: 'buy' | 'sell';
}
