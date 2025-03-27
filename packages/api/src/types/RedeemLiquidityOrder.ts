import { LiquidityOrder } from './LiquidityOrder.ts';
import { Currency } from '@splashprotocol/core';

/**
 * Redeem liquidity order representation
 */
export interface RedeemLiquidityOrder extends LiquidityOrder {
  /**
   * Operation type
   */
  readonly operation: 'redeem';

  /**
   * x of redeem order
   * @type {Currency}
   */
  readonly x: Currency;

  /**
   * y of redeem order
   * @type {Currency}
   */
  readonly y: Currency;

  /**
   * lq of redeem order
   * @type {Currency}
   */
  readonly lq: Currency;

  /**
   * Type of pool
   * @type {"weighted" | "cfmm" | "stable"}
   */
  readonly type: 'weighted' | 'cfmm' | 'stable';
}
