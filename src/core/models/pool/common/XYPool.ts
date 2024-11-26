import { PoolId } from '../../../../../build';
import { Splash } from '../../../../splash/splash.ts';
import { Pool, PoolType } from '../../../types/Pool.ts';
import {
  HexString,
  OutputReference,
  percent,
  uint,
} from '../../../types/types.ts';
import { math } from '../../../utils/math/math.ts';
import { ada } from '../../assetInfo/ada.ts';
import { AssetInfo } from '../../assetInfo/AssetInfo.ts';
import { usd } from '../../assetInfo/usd.ts';
import { Currency } from '../../currency/Currency.ts';
import { AssetInfoMismatchError } from '../../currency/errors/AssetInfoMismatchError.ts';
import { Transaction } from '../../transaction/Transaction.ts';
import { EMISSION_LP } from './emissionLp.ts';

export interface XYPoolConfig<Type extends PoolType> {
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
  readonly royaltyFee?: bigint;
  readonly royaltyX?: bigint;
  readonly royaltyY?: bigint;
  readonly royaltyNonce?: uint;
  readonly royaltyPk?: HexString;
  readonly royaltyUserAddress?: HexString;
  readonly lpBound?: bigint;
  readonly tvlADA?: number | bigint | Currency;
  readonly tvlUSD?: number | bigint | Currency;
  readonly volumeADA?: number | bigint | Currency;
  readonly volumeUSD?: number | bigint | Currency;
  readonly lpFeeADA?: number | bigint | Currency;
  readonly lpFeeUSD?: number | bigint | Currency;
  readonly apr?: percent;
  readonly apr30d?: percent;
  readonly outputId: OutputReference;
}

/**
 * XY pool representation
 */
export class XYPool<Type extends PoolType>
  implements Pool<Type, { x: Currency; y: Currency }>
{
  /**
   * Last pool output id
   */
  readonly outputId: OutputReference;

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
   * Pool x Fee in pct
   * @type {percent}
   */
  readonly xFee: percent;

  /**
   * Pool y fee in pct
   * @type {percent}
   */
  readonly yFee: percent;

  /**
   * Pool treasury fee in pct. Can be undefined
   * @type {percent | undefined}
   */
  readonly treasuryFee: percent;

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
   * Fee numerator of royalty
   * @type bigint
   */
  readonly royaltyFeeNumerator: bigint;

  /**
   * Amount of x token locked in royalty
   * @type Currency
   */
  readonly royaltyX: Currency;

  /**
   * Amount of y token locked in royalty
   * @type Currency
   */
  readonly royaltyY: Currency;

  /**
   * Pool royalty fee in pct. Can be undefined
   * @type {percent | undefined}
   */
  readonly royaltyFee: percent;

  /**
   * Pool royalty nonce. Need to withdrawal
   * @type {uint | undefined}
   */
  readonly royaltyNonce?: uint;

  /**
   * Pool royalty pk. Need to withdrawal
   * @type {HexString | undefined}
   */
  readonly royaltyPk?: HexString;

  /**
   * Pool royalty user address. Need to withdrawal
   * @type {HexString | undefined}
   */
  readonly royaltyUserAddress?: HexString;

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

  /**
   * Current pool apr 30d
   * @type {percent}
   */
  readonly apr30d?: percent;

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
      royaltyFee = 0n,
      royaltyX = 0n,
      royaltyY = 0n,
      lpBound = 0n,
      feeDenominator,
      tvlADA,
      tvlUSD,
      volumeADA,
      volumeUSD,
      lpFeeADA,
      lpFeeUSD,
      apr,
      apr30d,
      outputId,
      royaltyNonce,
      royaltyPk,
      royaltyUserAddress,
    }: XYPoolConfig<Type>,
    private splash: Splash<{}>,
  ) {
    this.outputId = outputId;
    this.nft = nft;
    this.id = nft.splashId;
    this.lq = lq;
    this.totalX = totalX;
    this.totalY = totalY;
    this.treasuryX = totalX.withAmount(treasuryX);
    this.treasuryY = totalY.withAmount(treasuryY);
    this.royaltyX = totalX.withAmount(royaltyX);
    this.royaltyY = totalY.withAmount(royaltyY);
    this.x = this.totalX.minus(this.treasuryX).minus(this.royaltyX);
    this.y = this.totalY.minus(this.treasuryY).minus(this.royaltyY);
    this.xFeeNumerator = xFee;
    this.yFeeNumerator = yFee;
    this.xFee = this.toPoolFeePct(xFee, feeDenominator);
    this.yFee = this.toPoolFeePct(yFee, feeDenominator);
    this.treasuryFee = treasuryFee
      ? this.toTreasuryFeePct(treasuryFee, feeDenominator)
      : Number(treasuryFee);
    this.treasuryFeeNumerator = treasuryFee;
    this.royaltyFee = royaltyFee
      ? this.toTreasuryFeePct(royaltyFee, feeDenominator)
      : Number(royaltyFee);

    this.royaltyNonce = royaltyNonce;
    this.royaltyPk = royaltyPk;
    this.royaltyUserAddress = royaltyUserAddress;
    this.royaltyFeeNumerator = royaltyFee;
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
    this.apr30d = apr30d;
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
    value: number | bigint | Currency | string | undefined,
    assetInfo: AssetInfo,
  ): Currency | undefined {
    if (!value) {
      return undefined;
    }
    if (value instanceof Currency) {
      return value;
    }
    const amount = typeof value === 'bigint' ? value : BigInt(value);
    return Currency.new(amount, assetInfo);
  }

  private toPoolFeePct(feeNum: bigint, feeDenom: bigint): percent {
    return Number(
      math.evaluate(`(1 - ${feeNum} / ${feeDenom}) * 100`).toFixed(3),
    );
  }

  private toTreasuryFeePct(feeNum: bigint, feeDenom: bigint): percent {
    return Number(math.evaluate(`${feeNum} / ${feeDenom} * 100`).toFixed(3));
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
      .xyDeposit(this as any, [x, y])
      .complete();
  }
}
