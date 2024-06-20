import { AssetInfo } from '../../../models/assetInfo/AssetInfo.ts';
import { lts } from '../../../types/types.ts';

export interface RecentTrade {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly price: number;
  readonly amount: string;
  readonly timestamp: lts;
  readonly side: 'sell' | 'buy';
}
