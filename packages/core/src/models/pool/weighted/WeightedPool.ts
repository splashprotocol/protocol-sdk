import { Pool } from '../common/Pool.ts';
import { Currency } from '../../currency/Currency.ts';
import { XYPool, XYPoolConfig } from '../common/XYPool/XYPool.ts';
import { percent } from '../../../types/percent.ts';

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
   * @return {WeightedPool}
   */
  static new(config: WeightedPoolConfig): WeightedPool {
    return new WeightedPool(config);
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

  private constructor({ xWeight, yWeight, ...config }: WeightedPoolConfig) {
    super({
      ...config,
      type: 'weighted',
      feeDenominator: 100000n,
    });
    this.xWeight = xWeight;
    this.yWeight = yWeight;
  }
}
