import { lts, price } from '../../../types/types.ts';

export interface RawRecentTrade {
  readonly price: price;
  readonly from: string;
  readonly to: string;
  readonly timestamp: lts;
  readonly side: 'buy' | 'sell';
}
