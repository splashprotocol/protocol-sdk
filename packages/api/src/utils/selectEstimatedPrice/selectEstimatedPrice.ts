import { OrderBook } from '../../types/OrderBook.ts';
import { AssetInfoMismatchError, Currency, Price } from '@splashprotocol/core';
import { PriceLessThanLovelaceError } from './errors/PriceLessThanLovelaceError.ts';
import { NoLiquidityError } from './errors/NoLiquidityError.ts';

export interface SelectEstimatedPriceParams {
  readonly orderBook: OrderBook;
  readonly input: Currency;
  readonly priceType?: 'average' | 'actual';
}

/**
 * Returns estimated price from orderBook and input
 * @param {SelectEstimatedPriceParams} config
 * @deprecated
 * @return {Price}
 */
export const selectEstimatedPrice = ({
  orderBook,
  input,
  priceType = 'average',
}: SelectEstimatedPriceParams): Price => {
  const isActualOrderBool =
    orderBook.spotPrice.base.isEquals(input.asset) ||
    orderBook.spotPrice.quote.isEquals(input.asset);

  if (!isActualOrderBool) {
    throw new AssetInfoMismatchError(
      `input asset is incorrect. Expected ${orderBook.spotPrice.base.assetId} or ${orderBook.spotPrice.quote.assetId}. Received ${input.asset.assetId}`,
    );
  }

  const isAsk = orderBook.base.isEquals(input.asset);
  let estimatedPrice: Price | undefined;

  if (isAsk && !orderBook.bids.length) {
    throw new PriceLessThanLovelaceError('Price of asset is lower than min');
  }
  if (!isAsk && !orderBook.asks.length) {
    throw new PriceLessThanLovelaceError('Price of asset is lower than min');
  }

  if (isAsk) {
    for (let i = 0; i < orderBook.bids.length; i++) {
      const bid = orderBook.bids[i];
      const accumulatedAmount = bid.accumulatedAmount.asset.isEquals(
        input.asset,
      )
        ? bid.accumulatedAmount
        : bid.accumulatedAmountInQuote;

      if (accumulatedAmount.gt(input)) {
        const priceToNormalize =
          priceType === 'average' ? bid.accumulatedAveragePrice : bid.price;
        estimatedPrice = priceToNormalize.quote.isEquals(input.asset)
          ? priceToNormalize
          : priceToNormalize.invert();
        break;
      }
    }
  } else {
    for (let i = 0; i < orderBook.asks.length; i++) {
      const ask = orderBook.asks[i];
      const accumulatedAmount = ask.accumulatedAmount.asset.isEquals(
        input.asset,
      )
        ? ask.accumulatedAmount
        : ask.accumulatedAmountInQuote;

      if (accumulatedAmount.gt(input)) {
        const priceToNormalize =
          priceType === 'average' ? ask.accumulatedAveragePrice : ask.price;
        estimatedPrice = priceToNormalize.quote.isEquals(input.asset)
          ? priceToNormalize
          : priceToNormalize.invert();
        break;
      }
    }
  }
  if (!estimatedPrice) {
    throw new NoLiquidityError('no liquidity for this price');
  }

  return estimatedPrice;
};
