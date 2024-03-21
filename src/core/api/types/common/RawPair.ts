import { AssetId, percent, price } from '../../../types/types.ts';

export interface RawPair {
  readonly base: AssetId;
  readonly quote: AssetId;
  readonly lastSpot: number;
  readonly change: percent;
  readonly baseAdaRate: price;
  readonly quoteAdaRate: price;
}
