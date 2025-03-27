/**
 * Returns Position or EmptyPosition from pool and balance
 * @param {AnyPool} pool
 * @param {Currencies} balance
 * @returns {AnyPosition}
 */
import { AnyPosition } from '../../types/AnyPosition.ts';
import { AnyPool } from '../../types/AnyPool.ts';
import { Currencies, Position } from '@splashprotocol/core';

export const selectPositionOrEmpty = (
  pool: AnyPool,
  balance: Currencies,
): AnyPosition => {
  return Position.new({
    pool,
    lq: balance.get(pool.lq.asset),
  }) as AnyPosition;
};
