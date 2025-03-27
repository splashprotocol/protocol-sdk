import { LiquidityOrder } from './LiquidityOrder.ts';
import { Currency } from '@splashprotocol/core';

/**
 * Deposit liquidity order representation
 */
export interface DepositLiquidityOrder extends LiquidityOrder {
  /**
   * Operation type
   */
  readonly operation: 'deposit';

  /**
   * Type of pool
   * @type {"weighted" | "cfmm" | "stable"}
   */
  readonly type: 'weighted' | 'cfmm' | 'stable';

  /**
   * x of Liquidity order
   * @type {Currency}
   */
  readonly x: Currency;

  /**
   * y of Liquidity order
   * @type {Currency}
   */
  readonly y: Currency;

  /**
   * lq of Liquidity order
   * @type {Currency}
   */
  readonly lq?: Currency;
}
