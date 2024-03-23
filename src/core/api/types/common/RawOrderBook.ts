import { AssetId } from '../../../types/types.ts';

export interface RawOrderBookItem {
  readonly spot: number;
  readonly ordersVolume: string;
  readonly poolsVolume: string;
  readonly accumulatedVolume: string;
  readonly ordersVolumeRelation: number;
  readonly ammVolumeRelation: number;
  readonly accumulatedVolumeRelation: number;
}

export interface RawOrderBook {
  readonly pair: {
    readonly base: AssetId;
    readonly quote: AssetId;
  };
  readonly spot: number;
  readonly previousSpotPrice?: number;
  readonly bidsOrderBook: RawOrderBookItem[];
  readonly asksOrderBook: RawOrderBookItem[];
  readonly ammTotalLiquidityBase: string;
  readonly ammTotalLiquidityQuote: string;
}
