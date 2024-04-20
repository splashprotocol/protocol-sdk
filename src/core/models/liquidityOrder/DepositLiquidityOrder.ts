import { Splash } from '../../../splash/splash.ts';
import { Currency } from '../currency/Currency.ts';
import {
  LiquidityOrder,
  LiquidityOrderConfig,
} from './common/LiquidityOrder.ts';

export interface DepositLiquidityOrderConfig extends LiquidityOrderConfig {
  readonly x: Currency;
  readonly y: Currency;
  readonly lq?: Currency;
}

/**
 * Deposit liquidity order representation
 */
export class DepositLiquidityOrder extends LiquidityOrder {
  /**
   * Creates new deposit liquidity order
   * @param {DepositLiquidityOrderConfig} config
   * @param {Splash<{}>} splash
   * @return {DepositLiquidityOrder}
   */
  static new(
    config: DepositLiquidityOrderConfig,
    splash: Splash<{}>,
  ): DepositLiquidityOrder {
    return new DepositLiquidityOrder(config, splash);
  }

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
  private constructor(
    { x, y, lq, ...rest }: DepositLiquidityOrderConfig,
    splash: Splash<{}>,
  ) {
    super(rest, splash);
    this.x = x;
    this.y = y;
    this.lq = lq;
  }
}
