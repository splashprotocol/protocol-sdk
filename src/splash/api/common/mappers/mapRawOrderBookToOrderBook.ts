import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import {
  RawOrderBook,
  RawOrderBookItem,
} from '../../../../core/api/types/common/RawOrderBook.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Price } from '../../../../core/models/price/Price.ts';
import { math } from '../../../../core/utils/math/math.ts';
import { OrderBook, OrderBookItem } from '../types/OrderBook.ts';

export interface MapRawOrderBookToOrderBookConfig {
  readonly baseMetadata?: AssetMetadata;
  readonly quoteMetadata?: AssetMetadata;
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
    raw: rawItem.avgPrice,
  });

  return {
    price: Price.new({
      base,
      quote,
      raw: rawItem.price,
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
  const [basePolicyId, baseBase16Name] = rawOrderBook.pair.base.split('.');
  const [quotePolicyId, quoteBase16Name] = rawOrderBook.pair.quote.split('.');

  const base = AssetInfo.new(
    {
      policyId: basePolicyId,
      name: baseBase16Name,
      type: 'base16',
    },
    baseMetadata,
  );
  const quote = AssetInfo.new(
    {
      policyId: quotePolicyId,
      name: quoteBase16Name,
      type: 'base16',
    },
    quoteMetadata,
  );

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
      raw: rawOrderBook.spot,
      base,
      quote,
    }),
    previousSpotPrice: rawOrderBook.previousSpot
      ? Price.new({
          raw: rawOrderBook.previousSpot,
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
