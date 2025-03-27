import { AnyPool } from '../../types/AnyPool.ts';
import { Currencies, Position } from '@splashprotocol/core';
import { AnyPosition } from '../../types/AnyPosition.ts';

/**
 * Combines params and returns Positions array
 * @param {AnyPool[]} pools
 * @param {Currencies} balance
 * @returns {AnyPosition}
 */
export const selectPositions = (
  pools: AnyPool[],
  balance: Currencies,
): AnyPosition[] => {
  return pools
    .filter((pool) => balance.get(pool.lq.asset).amount !== 0n)
    .map((pool) =>
      Position.new({
        pool,
        lq: balance.get(pool.lq.asset),
      }),
    ) as AnyPosition[];
};
