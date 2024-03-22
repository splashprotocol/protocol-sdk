import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Price } from '../../../../core/models/price/Price.ts';
import { percent } from '../../../../core/types/types.ts';

export interface OrderBookItem {
  readonly spot: Price;
  readonly ordersVolume: Currency;
  readonly poolsVolume: Currency;
  readonly accumulatedVolume: Currency;
  readonly ordersVolumeRelation: percent;
  readonly ammVolumeRelation: percent;
  readonly accumulatedVolumeRelation: percent;
}

export interface OrderBook {
  readonly pair: {
    readonly base: AssetInfo;
    readonly quote: AssetInfo;
  };
  readonly spotPrice: Price;
  readonly previousSpotPrice: Price;
  readonly bidsOrderBook: OrderBookItem[];
  readonly asksOrderBook: OrderBookItem[];
  readonly ammTotalLiquidityBase: Currency;
  readonly ammTotalLiquidityQuote: Currency;
}
