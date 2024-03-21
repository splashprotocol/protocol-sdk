import { percent } from '../../types/types.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { Price } from '../price/Price.ts';

export interface PairParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly change: percent;
  readonly spotPrice: Price;
  readonly baseAdaPrice: Price;
  readonly quoteAdaPrice: Price;
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
   * Base asset ada price
   * @type {Price}
   */
  public baseAdaPrice: Price;

  /**
   * Quote asset ada price
   * @type {Price}
   */
  public quoteAdaPrice: Price;

  private constructor({
    base,
    quote,
    change,
    spotPrice,
    quoteAdaPrice,
    baseAdaPrice,
  }: PairParams) {
    this.base = base;
    this.quote = quote;
    this.change = change;
    this.spotPrice = spotPrice;
    this.quoteAdaPrice = quoteAdaPrice;
    this.baseAdaPrice = baseAdaPrice;
  }
}
