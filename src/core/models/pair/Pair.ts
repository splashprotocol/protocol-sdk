import { percent } from '../../types/types.ts';
import {
  math,
  normalizeAmount,
  toBigNumRepresentation,
} from '../../utils/math/math.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { Currency } from '../currency/Currency.ts';
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
   * 24h change in quote asset
   * @type {percent}
   */
  public changeInQuote: Currency;

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

  private constructor({
    base,
    quote,
    change,
    spotPrice,
    quoteAdaPrice,
    baseAdaPrice,
  }: PairParams) {
    const rawPreviousSpotPrice: string = change
      ? math.evaluate(`${spotPrice.raw} * 100 / (100 + ${change})`).toFixed()
      : spotPrice.toString();

    const changeInQuoteAmount = toBigNumRepresentation(
      normalizeAmount(
        Math.abs(
          Number(
            math
              .evaluate(`${spotPrice.raw} - ${rawPreviousSpotPrice}`)
              .toFixed(),
          ),
        ).toString(),
        quote.decimals,
      ),
      quote.decimals,
    );

    this.base = base;
    this.quote = quote;
    this.change = change;
    this.spotPrice = spotPrice;
    this.prevSpotPrice = Price.new({
      base,
      quote,
      raw: Number(rawPreviousSpotPrice),
    });
    this.changeInQuote = Currency.new(changeInQuoteAmount, quote);
    this.quoteAdaPrice = quoteAdaPrice;
    this.baseAdaPrice = baseAdaPrice;
  }
}
