import { PoolId } from '../../../../../build';
import { Splash } from '../../../../splash/splash.ts';
import { Pool } from '../../../types/Pool.ts';
import { percent } from '../../../types/types.ts';
import { math } from '../../../utils/math/math.ts';
import { ada } from '../../assetInfo/ada.ts';
import { AssetInfo } from '../../assetInfo/AssetInfo.ts';
import { usd } from '../../assetInfo/usd.ts';
import { Currency } from '../../currency/Currency.ts';
import { AssetInfoMismatchError } from '../../currency/errors/AssetInfoMismatchError.ts';
import { Transaction } from '../../transaction/Transaction.ts';
import { EMISSION_LP } from './emissionLp.ts';

export interface XYPoolConfig<Type extends 'cfmm' | 'weighted'> {
  readonly type: Type;
  readonly nft: AssetInfo;
  readonly lq: Currency;
  readonly totalX: Currency;
  readonly totalY: Currency;
  readonly xFee: bigint;
  readonly yFee: bigint;
  readonly feeDenominator: bigint;
  readonly treasuryX?: bigint;
  readonly treasuryY?: bigint;
  readonly treasuryFee?: bigint;
  readonly lpBound?: bigint;
  readonly tvlADA?: number | bigint | Currency;
  readonly tvlUSD?: number | bigint | Currency;
  readonly volumeADA?: number | bigint | Currency;
  readonly volumeUSD?: number | bigint | Currency;
  readonly lpFeeADA?: number | bigint | Currency;
  readonly lpFeeUSD?: number | bigint | Currency;
  readonly apr?: percent;
}

/**
 * XY pool representation
 */
export class XYPool<Type extends 'cfmm' | 'weighted'>
  implements Pool<Type, { x: Currency; y: Currency }>
{
  /**
   * Type of pool. Can bee cfmm, weight and 3stablePool
   * @type {string}
   */
  readonly type: Type;

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
   * Current pool volume in ada
   * @type {Currency | undefined}
   */
  readonly volumeADA?: Currency;

  /**
   * Current pool volume in usd
   * @type {Currency | undefined}
   */
  readonly volumeUSD?: Currency;

  /**
   * Current pool fees in ada
   * @type {Currency | undefined}
   */
  readonly lpFeeADA?: Currency;

  /**
   * Current pool fees in usd
   * @type {Currency | undefined}
   */
  readonly lpFeeUSD?: Currency;

  /**
   * Current pool apr
   * @type {percent}
   */
  readonly apr?: percent;

  private supplyLP: bigint;

  protected constructor(
    {
      type,
      nft,
      lq,
      totalX,
      totalY,
      xFee,
      yFee,
      treasuryFee = 0n,
      treasuryX = 0n,
      treasuryY = 0n,
      lpBound = 0n,
      feeDenominator,
      tvlADA,
      tvlUSD,
      volumeADA,
      volumeUSD,
      lpFeeADA,
      lpFeeUSD,
      apr,
    }: XYPoolConfig<Type>,
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
    this.type = type;
    this.feeDenominator = feeDenominator;
    this.lqBound = Currency.ada(lpBound);
    this.supplyLP = EMISSION_LP - this.lq.amount;
    this.tvlADA = this.toCurrencyOrUndefined(tvlADA, ada);
    this.tvlUSD = this.toCurrencyOrUndefined(tvlUSD, usd);
    this.volumeADA = this.toCurrencyOrUndefined(volumeADA, ada);
    this.volumeUSD = this.toCurrencyOrUndefined(volumeUSD, usd);
    this.lpFeeADA = this.toCurrencyOrUndefined(lpFeeADA, ada);
    this.lpFeeUSD = this.toCurrencyOrUndefined(lpFeeUSD, usd);
    this.apr = apr;
  }

  /**
   * proportional amount of one token to a given input of the other
   * @param {Currency} input
   * @return {Currency}
   */
  getAnotherAssetForDeposit(input: Currency): Currency {
    if (
      !input.asset.isEquals(this.x.asset) &&
      !input.asset.isEquals(this.y.asset)
    ) {
      throw new AssetInfoMismatchError(
        `provided input is not x/y asset. Expected: ${this.x.asset.splashId} or ${this.y.asset.splashId}. Received: ${input.asset.splashId}`,
      );
    }

    const priceX = { numerator: this.y.amount, denominator: this.x.amount };
    const priceY = { numerator: this.x.amount, denominator: this.y.amount };

    if (input.asset.isEquals(this.x.asset)) {
      return this.y.withAmount(
        BigInt(
          math
            .evaluate(
              `(${input.amount} * ${priceX.numerator}) / ${priceX.denominator}`,
            )
            .toFixed(0),
        ),
      );
    } else {
      return this.x.withAmount(
        BigInt(
          math
            .evaluate(
              `(${input.amount} * ${priceY.numerator}) / ${priceY.denominator}`,
            )
            .toFixed(0),
        ),
      );
    }
  }

  /**
   * Converts given amount of x/y to lp
   * @param {Currency} x
   * @param {Currency} y
   * @return {Currency}
   */
  convertAssetsToLp({ x, y }: { x: Currency; y: Currency }): Currency {
    const normalizedX = x.asset.isEquals(this.x.asset) ? x : y;
    const normalizedY = y.asset.isEquals(this.y.asset) ? y : x;

    if (
      !normalizedX.asset.isEquals(this.x.asset) ||
      !normalizedY.asset.isEquals(this.y.asset)
    ) {
      throw new AssetInfoMismatchError(
        `some of input is missing in pool. Expected ${this.x.asset.splashId} and ${this.y.asset.splashId}. Received ${normalizedX.asset.splashId} and ${normalizedY.asset.splashId}`,
      );
    }

    const rewardXWise = (normalizedX.amount * this.supplyLP) / this.x.amount;
    const rewardYWise = (normalizedY.amount * this.supplyLP) / this.y.amount;

    return this.lq.withAmount(
      rewardXWise <= rewardYWise ? rewardXWise : rewardYWise,
    );
  }

  /**
   * Converts given lp amount to x/y assets
   * @param {Currency | bigint} lp
   * @returns {[Currency, Currency]}
   */
  convertLpToAssets(lp: Currency | bigint): { x: Currency; y: Currency } {
    const normalizedLp = lp instanceof Currency ? lp : this.lq.withAmount(lp);

    if (normalizedLp.asset.splashId !== this.lq.asset.splashId) {
      throw new AssetInfoMismatchError(
        `provided value is not lp token. \n Expected: ${this.lq.asset.splashId} \n Received: ${normalizedLp.asset.splashId}`,
      );
    }

    return {
      x: this.x.withAmount(
        (normalizedLp.amount * this.x.amount) / this.supplyLP,
      ),
      y: this.y.withAmount(
        (normalizedLp.amount * this.y.amount) / this.supplyLP,
      ),
    };
  }

  private toCurrencyOrUndefined(
    value: number | bigint | Currency | undefined,
    assetInfo: AssetInfo,
  ): Currency | undefined {
    if (!value) {
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
  deposit([x, y]: [Currency, Currency]): Promise<Transaction> {
    return this.splash
      .newTx()
      .cfmmDeposit(this as any, [x, y])
      .complete();
  }
}
