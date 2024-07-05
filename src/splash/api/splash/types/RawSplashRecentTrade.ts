import { price, ts } from '../../../../core/types/types.ts';

export interface RawSplashRecentTrade {
  price: price;
  from: string;
  to: string;
  timestamp: ts;
  side: 'sell' | 'buy';
}
