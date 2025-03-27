import { AssetId, price } from '@splashprotocol/core';

export interface RawPair {
  readonly base: AssetId;
  readonly quote: AssetId;
  readonly priceMinStep: price;
  readonly lastSpot: price;
  readonly change: string;
  readonly baseAdaRate: price;
  readonly quoteAdaRate: price;
}
