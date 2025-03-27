import { AssetInfoMismatchError, Currency, Price } from '@splashprotocol/core';
import { OrderBook } from '../../types/OrderBook.ts';
import { NoLiquidityError } from './errors/NoLiquidityError.ts';

interface CommonParams {
  readonly orderBook: OrderBook;
  readonly priceType?: 'average' | 'actual';
}

type OutputParams = { readonly output: Currency } & CommonParams;

type InputParams = { readonly input: Currency } & CommonParams;

export type FetchEstimatedPriceParams = OutputParams | InputParams;

const isEstimatedPriceV2OutputType = (
  params: FetchEstimatedPriceParams,
): params is OutputParams => {
  return (params as any).output;
};

/**
 * Returns estimated price from orderBook and input
 * @param {FetchEstimatedPriceParams} params
 * @return {Price}
 */
export const fetchEstimatedPrice = (params: FetchEstimatedPriceParams) => {
  const isOutput = isEstimatedPriceV2OutputType(params);
  const assetToFind = isEstimatedPriceV2OutputType(params)
    ? params.output
    : params.input;

  const isActualOrderBool =
    params.orderBook.spotPrice.base.isEquals(assetToFind.asset) ||
    params.orderBook.spotPrice.quote.isEquals(assetToFind.asset);

  if (!isActualOrderBool) {
    throw new AssetInfoMismatchError(
      `input asset is incorrect. Expected ${params.orderBook.spotPrice.base.assetId} or ${params.orderBook.spotPrice.quote.assetId}. Received ${assetToFind.asset.assetId}`,
    );
  }

  const isAsk = isEstimatedPriceV2OutputType(params)
    ? params.orderBook.quote.isEquals(assetToFind.asset)
    : params.orderBook.base.isEquals(assetToFind.asset);
  let estimatedPrice: Price | undefined;

  if (isAsk) {
    for (let i = 0; i < params.orderBook.bids.length; i++) {
      const bid = params.orderBook.bids[i];
      console.log(bid);
      const accumulatedAmount = bid.accumulatedAmount.asset.isEquals(
        assetToFind.asset,
      )
        ? bid.accumulatedAmount
        : bid.accumulatedAmountInQuote;

      if (accumulatedAmount.gte(assetToFind)) {
        const priceToNormalize =
          params.priceType === 'average'
            ? bid.accumulatedAveragePrice
            : bid.price;
        estimatedPrice =
          (isOutput && priceToNormalize.base.isEquals(assetToFind.asset)) ||
          (!isOutput && priceToNormalize.quote.isEquals(assetToFind.asset))
            ? priceToNormalize
            : priceToNormalize.invert();
        break;
      }
    }
  } else {
    for (let i = 0; i < params.orderBook.asks.length; i++) {
      const ask = params.orderBook.asks[i];
      const accumulatedAmount = ask.accumulatedAmount.asset.isEquals(
        assetToFind.asset,
      )
        ? ask.accumulatedAmount
        : ask.accumulatedAmountInQuote;

      if (accumulatedAmount.gte(assetToFind)) {
        const priceToNormalize =
          params.priceType === 'average'
            ? ask.accumulatedAveragePrice
            : ask.price;
        estimatedPrice =
          (isOutput && priceToNormalize.base.isEquals(assetToFind.asset)) ||
          (!isOutput && priceToNormalize.quote.isEquals(assetToFind.asset))
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
