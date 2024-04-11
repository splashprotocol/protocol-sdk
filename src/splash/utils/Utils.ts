import { Currencies } from '../../core/models/currencies/Currencies.ts';
import { CfmmPool } from '../../core/models/pool/cfmm/CfmmPool.ts';
import { Position } from '../../core/models/position/Position.ts';
import { Dictionary } from '../../core/types/types.ts';
import { CurrencyConverter } from '../../core/utils/currencyConverter/CurrencyConverter.ts';
import { Splash } from '../splash.ts';
import {
  SelectAssetBalanceParams,
  SelectAssetBalanceResult,
} from './types/selectAssetBalance.ts';
import {
  SelectLqAssetBalanceParams,
  SelectLqAssetBalanceResult,
} from './types/selectLqAssetBalance.ts';
import {
  SelectPositionOrEmptyParams,
  SelectPositionOrEmptyResult,
} from './types/selectPositionOrEmpty.ts';
import {
  SelectPositionsParams,
  SelectPositionsResult,
} from './types/selectPositions.ts';
import { SelectRatesParams, SelectRatesResult } from './types/selectRates.ts';

export class Utils {
  constructor(private splash: Splash<any>) {}

  /**
   * Returns balance includes only assets
   * @param {CfmmPool[]} pools
   * @param {Currencies} balance
   * @returns {SelectAssetBalanceResult}
   */
  selectAssetBalance({
    pools,
    balance,
  }: SelectAssetBalanceParams): SelectAssetBalanceResult {
    const poolsGroupedById = pools.reduce<Dictionary<CfmmPool>>((acc, pool) => {
      return { ...acc, [pool.lq.asset.splashId]: pool };
    }, {});

    return Currencies.new(
      balance
        .toArray()
        .filter((currency) => !poolsGroupedById[currency.asset.splashId]),
    );
  }

  /**
   * Returns balance includes only lq assets
   * @param {CfmmPool[]} pools
   * @param {Currencies} balance
   * @returns {SelectLqAssetBalanceResult}
   */
  selectLqAssetBalance({
    pools,
    balance,
  }: SelectLqAssetBalanceParams): SelectLqAssetBalanceResult {
    const poolsGroupedById = pools.reduce<Dictionary<CfmmPool>>((acc, pool) => {
      return { ...acc, [pool.lq.asset.splashId]: pool };
    }, {});

    return Currencies.new(
      balance
        .toArray()
        .filter((currency) => poolsGroupedById[currency.asset.splashId]),
    );
  }

  /**
   * Combines params and returns Positions array
   * @param {CfmmPool[]} pools
   * @param {Currencies} balance
   * @returns {SelectPositionsResult}
   */
  selectPositions({
    pools,
    balance,
  }: SelectPositionsParams): SelectPositionsResult {
    return pools
      .filter((pool) => balance.get(pool.lq.asset).amount !== 0n)
      .map((pool) =>
        Position.new(
          {
            pool,
            lq: balance.get(pool.lq.asset),
          },
          this.splash,
        ),
      );
  }

  /**
   * Returns Position or EmptyPosition from pool and balance
   * @param {CfmmPool} pool
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
    );
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
}
