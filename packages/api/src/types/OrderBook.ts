import { AssetInfo, Currency, percent, Price } from '@splashprotocol/core';

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
