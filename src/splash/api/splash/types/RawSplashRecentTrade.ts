import { ts } from '../../../../core/types/types.ts';

export interface RawSplashRecentTrade {
  price: number;
  from: string;
  to: string;
  timestamp: ts;
  side: 'sell' | 'buy';
}
