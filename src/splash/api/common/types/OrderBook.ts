import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Price } from '../../../../core/models/price/Price.ts';
import { percent } from '../../../../core/types/types.ts';

/**
 * Order book item representation
 */
export interface OrderBookItem {
  readonly price: Price;
  readonly accumulatedAveragePrice: Price;
  readonly ordersAmount: Currency;
  readonly ammAmount: Currency;
  readonly amount: Currency;
  readonly accumulatedAmount: Currency;
  readonly accumulatedAmountInQuote: Currency;
  readonly accumulatedAmountRelation: percent;
}

export interface OrderBook {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly spotPrice: Price;
  readonly previousSpotPrice?: Price;
  readonly bids: OrderBookItem[];
  readonly asks: OrderBookItem[];
  readonly ammTotalLiquidityBase: Currency;
  readonly ammTotalLiquidityQuote: Currency;
}
