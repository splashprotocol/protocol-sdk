import { Currencies } from '../../core/models/currencies/Currencies.ts';
import { AssetInfoMismatchError } from '../../core/models/currency/errors/AssetInfoMismatchError.ts';
import { DepositLiquidityOrder } from '../../core/models/liquidityOrder/DepositLiquidityOrder.ts';
import { RedeemLiquidityOrder } from '../../core/models/liquidityOrder/RedeemLiquidityOrder.ts';
import { CfmmPool } from '../../core/models/pool/cfmm/CfmmPool.ts';
import { WeightedPool } from '../../core/models/pool/weighted/WeightedPool.ts';
import { Position } from '../../core/models/position/Position.ts';
import { Price } from '../../core/models/price/Price.ts';
import { TradeOrder } from '../../core/models/tradeOrder/TradeOrder.ts';
import { Dictionary } from '../../core/types/types.ts';
import { CurrencyConverter } from '../../core/utils/currencyConverter/CurrencyConverter.ts';
import { math } from '../../core/utils/math/math.ts';
import { Splash } from '../splash.ts';
import { NoLiquidityError } from './errors/NoLiquidityError.ts';
import { PriceLessThanLovelaceError } from './errors/PriceLessThanLovelaceError.ts';
import {
  SelectAssetBalanceParams,
  SelectAssetBalanceResult,
} from './types/selectAssetBalance.ts';
import {
  SelectEstimatedPriceParams,
  SelectEstimatedPriceResult,
} from './types/selectEstimatedPrice.ts';
import {
  SelectLqAssetBalanceParams,
  SelectLqAssetBalanceResult,
} from './types/selectLqAssetBalance.ts';
import {
  SelectMempoolLiquidityOperationsParams,
  SelectMempoolLiquidityOperationsResult,
} from './types/selectMempoolLiquidityOperations.ts';
import {
  SelectMempoolTradeOrdersParams,
  SelectMempoolTradeOrdersResult,
} from './types/selectMempoolTradeOperations.ts';
import {
  SelectPositionOrEmptyParams,
  SelectPositionOrEmptyResult,
} from './types/selectPositionOrEmpty.ts';
import {
  SelectPositionsParams,
  SelectPositionsResult,
} from './types/selectPositions.ts';
import {
  SelectPriceImpactParams,
  SelectPriceImpactResult,
} from './types/selectPriceImpact.ts';
import { SelectRatesParams, SelectRatesResult } from './types/selectRates.ts';

export class Utils {
  constructor(private splash: Splash<any>) {}

  /**
   * Returns balance includes only assets
   * @param {(CfmmPool | WeightedPool)[]} pools
   * @param {Currencies} balance
   * @returns {SelectAssetBalanceResult}
   */
  selectAssetBalance({
    pools,
    balance,
  }: SelectAssetBalanceParams): SelectAssetBalanceResult {
    const poolsGroupedById = pools.reduce<Dictionary<CfmmPool | WeightedPool>>(
      (acc, pool) => {
        return { ...acc, [pool.lq.asset.splashId]: pool };
      },
      {},
    );

    return Currencies.new(
      balance
        .toArray()
        .filter((currency) => !poolsGroupedById[currency.asset.splashId]),
    );
  }

  /**
   * Returns balance includes only lq assets
   * @param {(CfmmPool | WeightedPool)[]} pools
   * @param {Currencies} balance
   * @returns {SelectLqAssetBalanceResult}
   */
  selectLqAssetBalance({
    pools,
    balance,
  }: SelectLqAssetBalanceParams): SelectLqAssetBalanceResult {
    const poolsGroupedById = pools.reduce<Dictionary<CfmmPool | WeightedPool>>(
      (acc, pool) => {
        return { ...acc, [pool.lq.asset.splashId]: pool };
      },
      {},
    );

    return Currencies.new(
      balance
        .toArray()
        .filter((currency) => poolsGroupedById[currency.asset.splashId]),
    );
  }

  /**
   * Combines params and returns Positions array
   * @param {(CfmmPool | WeightedPool)[]} pools
   * @param {Currencies} balance
   * @returns {SelectPositionsResult}
   */
  selectPositions({
    pools,
    balance,
  }: SelectPositionsParams): SelectPositionsResult {
    return pools
      .filter((pool) => balance.get(pool.lq.asset).amount !== 0n)
      .map(
        (pool) =>
          Position.new(
            {
              pool,
              lq: balance.get(pool.lq.asset),
            },
            this.splash,
          ) as Position<WeightedPool> | Position<CfmmPool>,
      );
  }

  /**
   * Returns Position or EmptyPosition from pool and balance
   * @param {CfmmPool | WeightedPool} pool
   * @param {Currencies} balance
   * @returns {SelectPositionOrEmptyResult}
   */
  selectPositionOrEmpty({
    pool,
    balance,
  }: SelectPositionOrEmptyParams): SelectPositionOrEmptyResult {
    return Position.new(
      {
        pool,
        lq: balance.get(pool.lq.asset),
      },
      this.splash,
    ) as Position<WeightedPool> | Position<CfmmPool>;
  }

  /**
   * Returns rates from pair
   * @param {Pair[]} pairs
   * @param {Price} adaUsdPrice
   * @return {SelectRatesResult}
   */
  selectRates({ pairs, adaUsdPrice }: SelectRatesParams): SelectRatesResult {
    return CurrencyConverter.new({
      prices: pairs.flatMap((pair) => [pair.baseAdaPrice, pair.quoteAdaPrice]),
      adaUsdPrice,
    });
  }

  /**
   * Returns estimated price from orderBook and input
   * @param {SelectEstimatedPriceParams} config
   * @return {SelectEstimatedPriceResult}
   */
  selectEstimatedPrice({
    orderBook,
    input,
    priceType = 'average',
  }: SelectEstimatedPriceParams): SelectEstimatedPriceResult {
    const isActualOrderBool =
      orderBook.spotPrice.base.isEquals(input.asset) ||
      orderBook.spotPrice.quote.isEquals(input.asset);

    if (!isActualOrderBool) {
      throw new AssetInfoMismatchError(
        `input asset is incorrect. Expected ${orderBook.spotPrice.base.splashId} or ${orderBook.spotPrice.quote.splashId}. Received ${input.asset.splashId}`,
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
  }

  /**
   * Returns price impact from currency or new price
   * @param {Price} spotPrice
   * @param {Currency | Price} input
   * @return {SelectPriceImpactResult}
   */
  selectPriceImpact({
    orderBook,
    input,
  }: SelectPriceImpactParams): SelectPriceImpactResult {
    const targetPrice =
      input instanceof Price
        ? input
        : this.selectEstimatedPrice({
            orderBook,
            input,
            priceType: 'actual',
          });

    if (!orderBook.spotPrice.isPriceAssetsEquals(targetPrice)) {
      throw new AssetInfoMismatchError('received prices with different assets');
    }
    const isAsk = orderBook.base.isEquals(targetPrice.quote);

    const firstBin = isAsk ? orderBook.bids[0] : orderBook.asks[0];
    const secondBin = isAsk ? orderBook.bids[1] : orderBook.asks[1];

    if (!firstBin) {
      console.warn('empty order book');
      return 0;
    }

    const firstBinPrice = firstBin.price.base.isEquals(targetPrice.base)
      ? firstBin.price
      : firstBin.price.invert();

    const rawPriceImpact = Math.abs(
      math.evaluate!(
        `(${targetPrice.raw} * 100 / ${firstBinPrice.raw}) - 100`,
      ).toFixed(2),
    );

    if (rawPriceImpact || input instanceof Price || !secondBin) {
      return rawPriceImpact;
    }

    const totalBinLiquidity = input.asset.isEquals(firstBin.price.base)
      ? firstBin.accumulatedAmount
      : firstBin.accumulatedAmountInQuote;
    const secondBinPrice = secondBin.price.base.isEquals(firstBinPrice.base)
      ? secondBin.price
      : secondBin.price.invert();

    const binsRelation = Math.abs(
      math.evaluate!(
        `(${secondBinPrice.raw} * 100 / ${firstBinPrice.raw}) - 100`,
      ).toFixed(2),
    );

    return Number(
      math
        .evaluate(
          `(${input.amount} / ${totalBinLiquidity.amount}) * ${binsRelation}`,
        )
        .toFixed(2),
    );
  }

  /**
   * Returns only trade orders from mempool
   * @param {SelectMempoolTradeOrdersParams} mempool
   * @return {SelectMempoolTradeOrdersResult}
   */
  selectMempoolTradeOrders(
    mempool: SelectMempoolTradeOrdersParams,
  ): SelectMempoolTradeOrdersResult {
    return mempool.filter(
      (item): item is TradeOrder => item instanceof TradeOrder,
    );
  }

  /**
   * Returns only liquidity orders from mempool
   * @param {SelectMempoolTradeOrdersParams} mempool
   * @return {SelectMempoolTradeOrdersResult}
   */
  selectMempoolLiquidityOrders(
    mempool: SelectMempoolLiquidityOperationsParams,
  ): SelectMempoolLiquidityOperationsResult {
    return mempool.filter(
      (item): item is DepositLiquidityOrder | RedeemLiquidityOrder =>
        item instanceof RedeemLiquidityOrder ||
        item instanceof DepositLiquidityOrder,
    );
  }
}
