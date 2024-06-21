import { lts } from '../../../types/types.ts';

export interface RawRecentTrade {
  readonly price: number;
  readonly from: string;
  readonly to: string;
  readonly timestamp: lts;
  readonly side: 'buy' | 'sell';
}
