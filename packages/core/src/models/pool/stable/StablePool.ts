import { Pool } from '../common/Pool.ts';
import { Currency } from '../../currency/Currency.ts';
import { XYPool, XYPoolConfig } from '../common/XYPool/XYPool.ts';

export type StablePoolConfig = Omit<
  Omit<XYPoolConfig<'stable'>, 'feeDenominator'>,
  'type'
>;

export class StablePool
  extends XYPool<'stable'>
  implements Pool<'stable', { x: Currency; y: Currency }>
{
  /**
   * Creates new instance of StablePool
   * @param {StablePoolConfig} config
   * @return {StablePool}
   */
  static new(config: StablePoolConfig): StablePool {
    return new StablePool(config);
  }

  private constructor(config: StablePoolConfig) {
    super({
      ...config,
      type: 'stable',
      feeDenominator: 100000n,
    });
  }
}
