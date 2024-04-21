import { Splash } from '../../../splash/splash.ts';
import { Currency } from '../currency/Currency.ts';
import {
  LiquidityOrder,
  LiquidityOrderConfig,
} from './common/LiquidityOrder.ts';

export interface RedeemLiquidityOrderConfig extends LiquidityOrderConfig {
  readonly type: 'weighted' | 'cfmm';
  readonly lq: Currency;
  readonly x: Currency;
  readonly y: Currency;
}

/**
 * Redeem liquidity order representation
 */
export class RedeemLiquidityOrder extends LiquidityOrder {
  /**
   * Returns redeem liquidity order
   * @param {RedeemLiquidityOrderConfig} config
   * @param {Splash<{}>} splash
   * @return {RedeemLiquidityOrder}
   */
  static new(
    config: RedeemLiquidityOrderConfig,
    splash: Splash<{}>,
  ): RedeemLiquidityOrder {
    return new RedeemLiquidityOrder(config, splash);
  }

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
   * @type {"weighted" | "cfmm"}
   */
  readonly type: 'weighted' | 'cfmm';

  private constructor(
    { x, lq, y, type, ...rest }: RedeemLiquidityOrderConfig,
    splash: Splash<{}>,
  ) {
    super(rest, splash);
    this.x = x;
    this.y = y;
    this.lq = lq;
    this.type = type;
  }
}
