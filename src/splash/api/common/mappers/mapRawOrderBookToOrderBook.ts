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
): OrderBookItem => ({
  spot: Price.new({
    base,
    quote,
    raw: rawItem.spot,
  }),
  ordersVolume: Currency.new(BigInt(rawItem.ordersVolume), base),
  poolsVolume: Currency.new(BigInt(rawItem.poolsVolume), base),
  accumulatedVolume: Currency.new(BigInt(rawItem.accumulatedVolume), base),
  accumulatedVolumeRelation: math
    .evaluate(`${rawItem.accumulatedVolumeRelation} * 100`)
    .toFixed(2),
  ammVolumeRelation: math
    .evaluate(`${rawItem.ammVolumeRelation} * 100`)
    .toFixed(2),
  ordersVolumeRelation: math
    .evaluate(`${rawItem.ordersVolumeRelation} * 100`)
    .toFixed(2),
});

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

  return {
    pair: {
      base,
      quote,
    },
    spotPrice: Price.new({
      raw: rawOrderBook.spot,
      base,
      quote,
    }),
    previousSpotPrice: Price.new({
      raw: rawOrderBook.previousSpotPrice,
      base,
      quote,
    }),
    ammTotalLiquidityBase: Currency.new(
      BigInt(rawOrderBook.ammTotalLiquidityBase),
      base,
    ),
    ammTotalLiquidityQuote: Currency.new(
      BigInt(rawOrderBook.ammTotalLiquidityQuote),
      quote,
    ),
    asksOrderBook: rawOrderBook.asksOrderBook.map((rawItem) =>
      mapRawOrderBookItemToOrderBookItem(base, quote, rawItem),
    ),
    bidsOrderBook: rawOrderBook.bidsOrderBook.map((rawItem) =>
      mapRawOrderBookItemToOrderBookItem(base, quote, rawItem),
    ),
  };
};
