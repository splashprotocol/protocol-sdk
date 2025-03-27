import { lts, price } from '@splashprotocol/core';

export interface Bar {
  readonly time: lts;
  readonly low: price;
  readonly high: price;
  readonly open: price;
  readonly close: price;
  readonly volume: price;
}
