import { Splash } from '../../../../splash/splash.ts';
import { Pool } from '../../../types/Pool.ts';
import { percent, PoolId } from '../../../types/types.ts';
import { math } from '../../../utils/math/math.ts';
import { ada } from '../../assetInfo/ada.ts';
import { AssetInfo } from '../../assetInfo/AssetInfo.ts';
import { usd } from '../../assetInfo/usd.ts';
import { Currency } from '../../currency/Currency.ts';
import { EMISSION_LP } from '../common/emissionLp.ts';
import { CfmmPoolType } from './common/CfmmPoolType.ts';

export interface CfmmPoolConfig {
  readonly nft: AssetInfo;
  readonly lq: Currency;
  readonly totalX: Currency;
  readonly totalY: Currency;
  readonly xFee: bigint;
  readonly yFee: bigint;
  readonly cfmmType: CfmmPoolType;
  readonly treasuryX?: bigint;
  readonly treasuryY?: bigint;
  readonly treasuryFee?: bigint;
  readonly lpBound?: bigint;
  readonly tvlADA?: number | bigint | Currency;
  readonly tvlUSD?: number | bigint | Currency;
  readonly volumeADA?: number | bigint | Currency;
  readonly volumeUSD?: number | bigint | Currency;
  readonly apr?: percent;
}

/**
 * Cfmm pool representation
 */
export class CfmmPool implements Pool<'cfmm'> {
  /**
   * Creates new instanceof pool
   * @param {CfmmPoolConfig} config
   * @returns {CfmmPool}
   */
  static new(config: CfmmPoolConfig, splash: Splash<any>): CfmmPool {
    return new CfmmPool(config, splash);
  }

  /**
   * Type of pool. Can bee cfmm, weight and 3stablePool
   * @type {string}
   */
  readonly type = 'cfmm';

  /**
   * Pool id
   * @type {Currency}
   */
  readonly id: PoolId;

  /**
   * Pool nft info
   * @type {Currency}
   */
  readonly nft: AssetInfo;

  /**
   * Pool lp amount and info
   * @type {Currency}
   */
  readonly lq: Currency;

  /**
   * Pool x amount and info with treasuryX
   * @type {Currency}
   */
  readonly totalX: Currency;

  /**
   * Pool y amount and info with treasuryY
   * @type {Currency}
   */
  readonly totalY: Currency;

  /**
   * Pool x amount and info
   * @type {Currency}
   */
  readonly x: Currency;

  /**
   * Pool y amount and info
   * @type {Currency}
   */
  readonly y: Currency;

  /**
   * Fee numerator of x asset
   * @type {bigint}
   */
  readonly xFeeNumerator: bigint;

  /**
   * Fee numerator of y asset
   * @type {bigint}
   */
  readonly yFeeNumerator: bigint;

  /**
   * Fee numerator of treasury
   * @type {bigint}
   */
  readonly treasuryFeeNumerator: bigint;

  /**
   * Denominator of pool fees
   * @type {bigint}
   */
  readonly feeDenominator: bigint;

  /**
   * Type of cfmm pool. Can be default, feeSwitch, bidirectionalFees
   * @type {CfmmPoolType}
   */
  readonly cfmmType: CfmmPoolType;

  /**
   * Amount of x token locked in dao treasury
   * @type {Currency}
   */
  readonly treasuryX: Currency;

  /**
   * Amount of y token locked in dao treasury
   * @type {Currency}
   */
  readonly treasuryY: Currency;

  /**
   * Bottom bound of pool liquidity for swaps in current pool
   * @type {Currency}
   */
  readonly lqBound: Currency;

  /**
   * Current pool tvl in ada.
   * @type {Currency | undefined}
   */
  readonly tvlADA?: Currency;

  /**
   * Current pool tvl in usd.
   * @type {Currency | undefined}
   */
  readonly tvlUSD?: Currency;

  /**
   * Current pool apr in ada
   * @type {Currency | undefined}
   */
  readonly volumeADA?: Currency;

  /**
   * Current pool apr in usd
   * @type {Currency | undefined}
   */
  readonly volumeUSD?: Currency;

  /**
   * Current pool apr
   * @type {percent}
   */
  readonly apr?: percent;

  private supplyLP: bigint;

  private constructor(
    {
      nft,
      lq,
      totalX,
      totalY,
      xFee,
      yFee,
      treasuryFee = 0n,
      cfmmType,
      treasuryX = 0n,
      treasuryY = 0n,
      lpBound = 0n,
      tvlADA,
      tvlUSD,
      volumeADA,
      volumeUSD,
      apr,
    }: CfmmPoolConfig,
    private splash: Splash<{}>,
  ) {
    this.nft = nft;
    this.id = nft.splashId;
    this.lq = lq;
    this.totalX = totalX;
    this.totalY = totalY;
    this.treasuryX = totalX.withAmount(treasuryX);
    this.treasuryY = totalY.withAmount(treasuryY);
    this.x = this.totalX.minus(this.treasuryX);
    this.y = this.totalY.minus(this.treasuryY);
    this.xFeeNumerator = xFee;
    this.yFeeNumerator = yFee;
    this.treasuryFeeNumerator = treasuryFee;
    this.cfmmType = cfmmType;
    this.feeDenominator = cfmmType === 'default' ? 1000n : 100000n;
    this.lqBound = Currency.ada(lpBound);
    this.supplyLP = EMISSION_LP - this.lq.amount;
    this.tvlADA = this.toCurrencyOrUndefined(tvlADA, ada);
    this.tvlUSD = this.toCurrencyOrUndefined(tvlUSD, usd);
    this.volumeADA = this.toCurrencyOrUndefined(volumeADA, ada);
    this.volumeUSD = this.toCurrencyOrUndefined(volumeUSD, usd);
    this.apr = apr;
  }

  /**
   * Converts given lp amount to x/y assets
   * @param {Currency | bigint} lp
   * @returns {[Currency, Currency]}
   */
  convertLpToXY(lp: Currency | bigint): [Currency, Currency] {
    const normalizedLp = lp instanceof Currency ? lp : this.lq.withAmount(lp);

    if (normalizedLp.asset.splashId !== this.lq.asset.splashId) {
      throw new Error(
        `provided value is not lp token. \n Expected: ${this.lq.asset.splashId} \n Received: ${normalizedLp.asset.splashId}`,
      );
    }

    return [
      this.x.withAmount((normalizedLp.amount * this.x.amount) / this.supplyLP),
      this.y.withAmount((normalizedLp.amount * this.y.amount) / this.supplyLP),
    ];
  }

  private toCurrencyOrUndefined(
    value: number | bigint | Currency | undefined,
    assetInfo: AssetInfo,
  ): Currency | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value instanceof Currency) {
      return value;
    }
    const amount =
      typeof value === 'bigint'
        ? value
        : BigInt(
            math
              .evaluate(
                `${value.toFixed(assetInfo.decimals)} * ${math.pow(
                  10,
                  assetInfo.decimals,
                )}`,
              )
              .toFixed(),
          );
    return Currency.new(amount, assetInfo);
  }

  /**
   * Deposit assets to current pool
   * @param {Currency} x
   * @param {Currency} y
   * @returns {Promise<any>}
   */
  deposit([x, y]: [Currency, Currency]) {
    return this.splash.newTx().cfmmDeposit(this, [x, y]).complete();
  }
}
