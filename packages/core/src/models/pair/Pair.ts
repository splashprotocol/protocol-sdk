import { math } from '../../utils/math/math.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { Price } from '../price/Price.ts';
import { percent } from '../../types/percent.ts';

export interface PairParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly change: percent;
  readonly spotPrice: Price;
  readonly baseAdaPrice: Price;
  readonly quoteAdaPrice: Price;
  readonly priceMinStep: Price;
}

/**
 * Trade pair representation
 */
export class Pair {
  /**
   * Creates new pair using specified params
   * @param {PairParams} params
   * @return {Pair}
   */
  static new(params: PairParams): Pair {
    return new Pair(params);
  }

  /**
   * Base currency asset info
   * @type {AssetInfo}
   */
  public base: AssetInfo;

  /**
   * Quote currency asset info
   * @type {AssetInfo}
   */
  public quote: AssetInfo;

  /**
   * 24h change percent
   * @type {percent}
   */
  public change: percent;

  /**
   * Current spot price
   * @type {Price}
   */
  public spotPrice: Price;

  /**
   * prev spot price
   * @type {Price}
   */
  public prevSpotPrice: Price;

  /**
   * Base asset ada price
   * @type {Price}
   */
  public baseAdaPrice: Price;

  /**
   * Quote asset ada price
   * @type {Price}
   */
  public quoteAdaPrice: Price;

  /**
   * Price min step in order book
   */
  public priceMinStep: Price;

  /**
   * Returns true if pair includes specified asses
   * @param {AssetInfo} asset1
   * @param {AssetInfo} asset2
   * @return {boolean}
   */
  includesSpecifiedAssets([asset1, asset2]: [AssetInfo, AssetInfo]): boolean {
    return (
      (this.base.assetId === asset1.assetId &&
        this.quote.assetId === asset2.assetId) ||
      (this.base.assetId === asset2.assetId &&
        this.quote.assetId === asset1.assetId)
    );
  }

  private constructor({
    base,
    quote,
    change,
    spotPrice,
    quoteAdaPrice,
    baseAdaPrice,
    priceMinStep,
  }: PairParams) {
    const rawPreviousSpotPrice: string = change
      ? math.evaluate(`${spotPrice.raw} * 100 / (100 + ${change})`).toFixed()
      : spotPrice.toString();

    this.base = base;
    this.quote = quote;
    this.change = change;
    this.spotPrice = spotPrice;
    this.prevSpotPrice = Price.new({
      base,
      quote,
      value: rawPreviousSpotPrice,
    });
    this.quoteAdaPrice = quoteAdaPrice;
    this.baseAdaPrice = baseAdaPrice;
    this.priceMinStep = priceMinStep;
  }
}
