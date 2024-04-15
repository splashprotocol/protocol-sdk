import { Splash } from '../../../../splash/splash.ts';
import { Pool } from '../../../types/Pool.ts';
import { Currency } from '../../currency/Currency.ts';
import { XYPool, XYPoolConfig } from '../common/XYPool.ts';
import { CfmmPoolType } from './common/CfmmPoolType.ts';

export interface CfmmPoolConfig
  extends Omit<Omit<XYPoolConfig<'cfmm'>, 'feeDenominator'>, 'type'> {
  readonly cfmmType: CfmmPoolType;
}

/**
 * Cfmm pool representation
 */
export class CfmmPool
  extends XYPool<'cfmm'>
  implements Pool<'cfmm', { x: Currency; y: Currency }>
{
  /**
   * Creates new instance of CfmmPool
   * @param {CfmmPoolConfig} config
   * @param {Splash<{}>} splash
   * @return {CfmmPool}
   */
  static new(config: CfmmPoolConfig, splash: Splash<{}>): CfmmPool {
    return new CfmmPool(config, splash);
  }
  /**
   * Type of cfmm pool. Can be default, feeSwitch, bidirectionalFees
   * @type {CfmmPoolType}
   */
  readonly cfmmType: CfmmPoolType;

  private constructor(
    { cfmmType, ...config }: CfmmPoolConfig,
    splash: Splash<{}>,
  ) {
    super(
      {
        ...config,
        type: 'cfmm',
        feeDenominator: cfmmType === 'default' ? 1000n : 100000n,
      },
      splash,
    );
    this.cfmmType = cfmmType;
  }
}
