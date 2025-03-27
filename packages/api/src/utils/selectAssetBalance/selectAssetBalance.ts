import { Currencies, Dictionary, Pool } from '@splashprotocol/core';

/**
 * Returns balance includes only assets
 * @param {Pool[]} pools
 * @param {Currencies} balance
 * @returns {Currencies}
 */
export const selectAssetBalance = (
  pools: Pool<any, any>[],
  balance: Currencies,
): Currencies => {
  const poolsGroupedById = pools.reduce<Dictionary<Pool<any, any>>>(
    (acc, pool) => {
      return { ...acc, [pool.lq.asset.assetId]: pool };
    },
    {},
  );

  return Currencies.new(
    balance
      .toArray()
      .filter((currency) => !poolsGroupedById[currency.asset.assetId]),
  );
};
