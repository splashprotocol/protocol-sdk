import { Splash } from '../../../../splash/splash.ts';
import { Pool } from '../../../types/Pool.ts';
import { Currency } from '../../currency/Currency.ts';
import { XYPool, XYPoolConfig } from '../common/XYPool.ts';

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
   * @param {Splash<{}>} splash
   * @return {StablePool}
   */
  static new(config: StablePoolConfig, splash: Splash<{}>): StablePool {
    return new StablePool(config, splash);
  }

  private constructor(config: StablePoolConfig, splash: Splash<{}>) {
    super(
      {
        ...config,
        type: 'stable',
        feeDenominator: 100000n,
      },
      splash,
    );
  }
}
