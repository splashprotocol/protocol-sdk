import { AssetId, price } from '../../../types/types.ts';

export interface RawPair {
  readonly base: AssetId;
  readonly quote: AssetId;
  readonly priceMinStep: price;
  readonly lastSpot: price;
  readonly change: string;
  readonly baseAdaRate: price;
  readonly quoteAdaRate: price;
}
