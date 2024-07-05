import { AssetId, price } from '../../../types/types.ts';

export interface RawOrderBookItem {
  readonly price: price;
  readonly avgPrice: price;
  readonly ordersLiquidity: string;
  readonly poolsLiquidity: string;
  readonly accumulatedLiquidity: string;
  readonly volumeRelation: number;
}

export interface RawOrderBook {
  readonly pair: {
    readonly base: AssetId;
    readonly quote: AssetId;
  };
  readonly spot: string;
  readonly previousSpot?: string;
  readonly bids: RawOrderBookItem[];
  readonly asks: RawOrderBookItem[];
  readonly ammTotalLiquidityBase: string;
  readonly ammTotalLiquidityQuote: string;
}
