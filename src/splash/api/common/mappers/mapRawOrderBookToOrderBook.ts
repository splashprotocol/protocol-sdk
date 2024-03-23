import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import {
  RawOrderBook,
  RawOrderBookItem,
} from '../../../../core/api/types/common/RawOrderBook.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Price } from '../../../../core/models/price/Price.ts';
import {
  math,
  normalizeAmount,
  toBigNumRepresentation,
  toNumberRepresentation,
} from '../../../../core/utils/math/math.ts';
import { OrderBook, OrderBookItem } from '../types/OrderBook.ts';

interface OrderBookItemAdditionalInfo {
  readonly accumulatedAveragePrice: number;
  readonly accumulatedOrderAmount: Currency;
  readonly accumulatedAmmAmount: Currency;
  readonly accumulatedAmountInQuote: Currency;
  readonly accumulatedOrderAmountInQuote: Currency;
  readonly accumulatedAmmAmountInQuote: Currency;
  readonly items: OrderBookItem[];
}

const getNextOrderBookItemAdditionalInfo = (
  additionalInfo: OrderBookItemAdditionalInfo,
  item: RawOrderBookItem,
  base: AssetInfo,
  quote: AssetInfo,
): OrderBookItemAdditionalInfo => {
  const newAveragePrice =
    additionalInfo.items.reduce((acc, i) => {
      return math.evaluate(`${acc} + ${i.price.raw}`);
    }, item.spot) /
    (additionalInfo.items.length + 1);

  const newPoolsInAmountQuote = toBigNumRepresentation(
    normalizeAmount(
      math
        .evaluate(
          `${toNumberRepresentation(item.poolsVolume, base.decimals)} * ${
            item.spot
          }`,
        )
        .toFixed(),
      quote.decimals,
    ),
    quote.decimals,
  );

  const newOrdersAmountInQuote = toBigNumRepresentation(
    normalizeAmount(
      math
        .evaluate(
          `${toNumberRepresentation(item.ordersVolume, base.decimals)} * ${
            item.spot
          }`,
        )
        .toFixed(),
      quote.decimals,
    ),
    quote.decimals,
  );

  const newAdditionalData: OrderBookItemAdditionalInfo = {
    accumulatedAveragePrice: newAveragePrice,
    accumulatedAmmAmount: additionalInfo.accumulatedAmmAmount.plus(
      Currency.new(BigInt(item.poolsVolume), base),
    ),
    accumulatedOrderAmount: additionalInfo.accumulatedOrderAmount.plus(
      Currency.new(BigInt(item.ordersVolume), base),
    ),
    accumulatedAmountInQuote: additionalInfo.accumulatedAmountInQuote.plus(
      Currency.new(newPoolsInAmountQuote + newOrdersAmountInQuote, quote),
    ),
    accumulatedAmmAmountInQuote: additionalInfo.accumulatedAmountInQuote.plus(
      Currency.new(newPoolsInAmountQuote, quote),
    ),
    accumulatedOrderAmountInQuote: additionalInfo.accumulatedAmountInQuote.plus(
      Currency.new(newOrdersAmountInQuote, quote),
    ),
    items: additionalInfo.items,
  };

  return {
    ...newAdditionalData,
    items: newAdditionalData.items.concat([
      mapRawOrderBookItemToOrderBookItem(base, quote, item, newAdditionalData),
    ]),
  };
};

export interface MapRawOrderBookToOrderBookConfig {
  readonly baseMetadata?: AssetMetadata;
  readonly quoteMetadata?: AssetMetadata;
  readonly rawOrderBook: RawOrderBook;
}

export const mapRawOrderBookItemToOrderBookItem = (
  base: AssetInfo,
  quote: AssetInfo,
  rawItem: RawOrderBookItem,
  {
    accumulatedAveragePrice,
    accumulatedOrderAmount,
    accumulatedAmmAmount,
    accumulatedAmountInQuote,
    accumulatedOrderAmountInQuote,
    accumulatedAmmAmountInQuote,
  }: OrderBookItemAdditionalInfo,
): OrderBookItem => ({
  price: Price.new({
    base,
    quote,
    raw: rawItem.spot,
  }),
  accumulatedAveragePrice: Price.new({
    base,
    quote,
    raw: accumulatedAveragePrice,
  }),
  ordersAmount: Currency.new(BigInt(rawItem.ordersVolume), base),
  ammAmount: Currency.new(BigInt(rawItem.poolsVolume), base),
  amount: Currency.new(
    BigInt(rawItem.poolsVolume) + BigInt(rawItem.ordersVolume),
    base,
  ),
  accumulatedAmount: Currency.new(BigInt(rawItem.accumulatedVolume), base),
  accumulatedOrderAmount: accumulatedOrderAmount,
  accumulatedAmmAmount: accumulatedAmmAmount,
  accumulatedAmountInQuote: accumulatedAmountInQuote,
  accumulatedOrderAmountInQuote: accumulatedOrderAmountInQuote,
  accumulatedAmmAmountInQuote: accumulatedAmmAmountInQuote,
  accumulatedAmountRelation: math
    .evaluate(`${rawItem.accumulatedVolumeRelation} * 100`)
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

  const asks = rawOrderBook.asksOrderBook
    .sort((item1, item2) => item1.spot - item2.spot)
    .reduce(
      (
        acc: { items: OrderBookItem[] } & OrderBookItemAdditionalInfo,
        item: RawOrderBookItem,
      ) => getNextOrderBookItemAdditionalInfo(acc, item, base, quote),
      {
        accumulatedAveragePrice: 0,
        accumulatedAmmAmount: Currency.new(0n, base),
        accumulatedOrderAmount: Currency.new(0n, base),
        accumulatedAmountInQuote: Currency.new(0n, quote),
        accumulatedAmmAmountInQuote: Currency.new(0n, quote),
        accumulatedOrderAmountInQuote: Currency.new(0n, quote),
        items: [],
      } as { items: OrderBookItem[] } & OrderBookItemAdditionalInfo,
    );

  const bids = rawOrderBook.bidsOrderBook
    .sort((item1, item2) => item2.spot - item1.spot)
    .reduce(
      (
        acc: { items: OrderBookItem[] } & OrderBookItemAdditionalInfo,
        item: RawOrderBookItem,
      ) => getNextOrderBookItemAdditionalInfo(acc, item, base, quote),
      {
        accumulatedAveragePrice: 0,
        accumulatedAmmAmount: Currency.new(0n, base),
        accumulatedOrderAmount: Currency.new(0n, base),
        accumulatedAmountInQuote: Currency.new(0n, quote),
        accumulatedAmmAmountInQuote: Currency.new(0n, quote),
        accumulatedOrderAmountInQuote: Currency.new(0n, quote),
        items: [],
      } as { items: OrderBookItem[] } & OrderBookItemAdditionalInfo,
    );

  return {
    base,
    quote,
    spotPrice: Price.new({
      raw: rawOrderBook.spot,
      base,
      quote,
    }),
    previousSpotPrice: rawOrderBook.previousSpotPrice
      ? Price.new({
          raw: rawOrderBook.previousSpotPrice,
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
    asks: asks.items,
    bids: bids.items,
  };
};
