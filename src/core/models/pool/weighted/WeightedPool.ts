import { Splash } from '../../../../splash/splash.ts';
import { Pool } from '../../../types/Pool.ts';
import { percent } from '../../../types/types.ts';
import { Currency } from '../../currency/Currency.ts';
import { XYPool, XYPoolConfig } from '../common/XYPool.ts';

export interface WeightedPoolConfig
  extends Omit<Omit<XYPoolConfig<'weighted'>, 'feeDenominator'>, 'type'> {
  readonly xWeight: percent;
  readonly yWeight: percent;
}

/**
 * Weighted pool representation
 */
export class WeightedPool
  extends XYPool<'weighted'>
  implements Pool<'weighted', { x: Currency; y: Currency }>
{
  /**
   * Creates new instance of CfmmPool
   * @param {WeightedPoolConfig} config
   * @param {Splash<{}>} splash
   * @return {WeightedPool}
   */
  static new(config: WeightedPoolConfig, splash: Splash<{}>): WeightedPool {
    return new WeightedPool(config, splash);
  }

  /**
   * Weight of x asset
   * @type {percent}
   */
  readonly xWeight: percent;

  /**
   * Weight of y asset
   * @type {percent}
   */
  readonly yWeight: percent;

  private constructor(
    { xWeight, yWeight, ...config }: WeightedPoolConfig,
    splash: Splash<{}>,
  ) {
    super(
      {
        ...config,
        type: 'weighted',
        feeDenominator: 100000n,
      },
      splash,
    );
    this.xWeight = xWeight;
    this.yWeight = yWeight;
  }
}
