import {
  AssetInfo,
  AssetInfoMetadata,
  Currency,
  math,
  Price,
} from '@splashprotocol/core';
import { RawOrderBook, RawOrderBookItem } from './RawOrderBook.ts';
import { OrderBook, OrderBookItem } from '../../../../../types/OrderBook.ts';

export interface MapRawOrderBookToOrderBookConfig {
  readonly baseMetadata?: AssetInfoMetadata;
  readonly quoteMetadata?: AssetInfoMetadata;
  readonly rawOrderBook: RawOrderBook;
}

export const mapRawOrderBookItemToOrderBookItem = (
  base: AssetInfo,
  quote: AssetInfo,
  rawItem: RawOrderBookItem,
): OrderBookItem => {
  const avgPrice = Price.new({
    base,
    quote,
    value: rawItem.avgPrice,
  });

  return {
    price: Price.new({
      base,
      quote,
      value: rawItem.price,
    }),
    accumulatedAveragePrice: avgPrice,
    ordersAmount: Currency.new(BigInt(rawItem.ordersLiquidity), base),
    ammAmount: Currency.new(BigInt(rawItem.poolsLiquidity), base),
    amount: Currency.new(
      BigInt(rawItem.poolsLiquidity) + BigInt(rawItem.ordersLiquidity),
      base,
    ),
    accumulatedAmount: Currency.new(BigInt(rawItem.accumulatedLiquidity), base),
    accumulatedAmountInQuote: avgPrice.getNecessaryQuoteFor(
      Currency.new(BigInt(rawItem.accumulatedLiquidity), base),
    ),
    accumulatedAmountRelation: math
      .evaluate(`${rawItem.volumeRelation} * 100`)
      .toFixed(2),
  };
};

export const mapRawOrderBookToOrderBook = ({
  rawOrderBook,
  baseMetadata,
  quoteMetadata,
}: MapRawOrderBookToOrderBookConfig): OrderBook => {
  const base = AssetInfo.fromAssetId(rawOrderBook.pair.base, baseMetadata);
  const quote = AssetInfo.fromAssetId(rawOrderBook.pair.quote, quoteMetadata);

  const asks = rawOrderBook.asks.map((rawOrderBookItem) =>
    mapRawOrderBookItemToOrderBookItem(base, quote, rawOrderBookItem),
  );
  const bids = rawOrderBook.bids.map((rawOrderBookItem) =>
    mapRawOrderBookItemToOrderBookItem(base, quote, rawOrderBookItem),
  );

  return {
    base,
    quote,
    spotPrice: Price.new({
      value: rawOrderBook.spot,
      base,
      quote,
    }),
    previousSpotPrice: rawOrderBook.previousSpot
      ? Price.new({
          value: rawOrderBook.previousSpot,
          base,
          quote,
        })
      : undefined,
    ammTotalLiquidityBase: Currency.new(
      BigInt(rawOrderBook.ammTotalLiquidityBase),
      base,
    ),
    ammTotalLiquidityQuote: Currency.new(
      BigInt(rawOrderBook.ammTotalLiquidityQuote),
      quote,
    ),
    asks,
    bids,
  };
};
