import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { Currency } from '../currency/Currency.ts';
import { AssetInfoMismatchError } from '../currency/errors/AssetInfoMismatchError.ts';
import { math } from '../../utils/math/math.ts';
import { valueToRational } from '../../utils/math/valueToRational/valueToRational.ts';
import { RationalNumber } from '../../types/RationalNumber.ts';
import { percent } from '../../types/percent.ts';
import { rationalToValue } from '../../utils/math/rationalToValue/rationalToValue.ts';

export const toRawPrice = (
  input: string,
  base: AssetInfo,
  quote: AssetInfo,
): string => {
  return math
    .evaluate(`${input} * 10^${quote.decimals - base.decimals}`)
    .toFixed();
};

export const fromRawPrice = (
  input: string,
  base: AssetInfo,
  quote: AssetInfo,
): string => {
  return math
    .evaluate(`${input} / 10^${quote.decimals - base.decimals}`)
    .toFixed();
};

export interface PriceParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly value: string | RationalNumber;
}

/**
 * Asset price representation
 */
export class Price {
  /**
   * Create new price params instance from config
   * @param {PriceParams} params
   * @returns {Price}
   */
  static new(params: PriceParams): Price {
    return new Price(params);
  }

  /**
   * Price base asset
   * @type {AssetInfo}
   */
  public readonly base: AssetInfo;

  /**
   * Price base asset
   * @type {AssetInfo}
   */
  public readonly quote: AssetInfo;

  /**
   * Raw price number
   * @type {number}
   */
  public readonly raw: string;

  /**
   * Rational representation of price
   */
  public readonly rational: RationalNumber;

  private constructor({ base, quote, value }: PriceParams) {
    this.base = base;
    this.quote = quote;
    this.raw =
      typeof value === 'string' ? value || '0' : rationalToValue(value);
    this.rational =
      typeof value === 'string' ? valueToRational(value || '0') : value;
  }

  /**
   * Inverts current price. Result oldQuote/oldBase rate
   * @returns {Price}
   */
  invert(): Price {
    const invertedRawPrice = math.evaluate(`1 / ${this.raw}`).toFixed();

    return Price.new({
      base: this.quote,
      quote: this.base,
      value: invertedRawPrice,
    });
  }

  /**
   * Method expects currency with base asset
   * and returns how much quote currency do you need for received base
   * @param {Currency | bigint} baseCurrency
   * @return Currency
   */
  getNecessaryQuoteFor(baseCurrency: Currency | bigint): Currency {
    this.assertCurrency(this.base, baseCurrency, '"getNecessaryQuoteFor"');

    const amount =
      baseCurrency instanceof Currency ? baseCurrency.amount : baseCurrency;

    return Currency.new(
      BigInt(math.evaluate(`${this.raw} * ${amount}`).floor().toFixed()),
      this.quote,
    );
  }

  /**
   * Method expects currency with quoteCurrency asset
   * and returns how much base currency do you received for specified quote
   * @param {Currency | bigint} quoteCurrency
   * @return Currency
   */
  getReceivedBaseFor(quoteCurrency: Currency | bigint): Currency {
    this.assertCurrency(this.quote, quoteCurrency, '"getReceivedBaseFor"');

    if (!Number(this.raw)) {
      return Currency.new(0n, this.base);
    }

    const amount =
      quoteCurrency instanceof Currency ? quoteCurrency.amount : quoteCurrency;

    return Currency.new(
      BigInt(math.evaluate(`${amount} / ${this.raw}`).floor().toFixed()),
      this.base,
    );
  }

  /**
   * Returns cross price. SFP/ADA * ADA/SPLASH = SPF/SPLASH / SFP/ADA * SPLASH/ADA = SPF/SPLASH
   * @param {Price} priceToCross
   * @return {Price}
   */
  cross(priceToCross: Price): Price {
    if (
      this.base.assetId !== priceToCross.base.assetId &&
      this.base.assetId !== priceToCross.quote.assetId &&
      this.quote.assetId !== priceToCross.base.assetId &&
      this.quote.assetId !== priceToCross.quote.assetId
    ) {
      throw new AssetInfoMismatchError(
        `
can't calculate cross price with this price.
Expected that one assetInput of received price will be equal base or qoute asset of current price.
Current price: ${this.base.ticker} / ${this.quote.ticker}. Received ${priceToCross.base.ticker} / ${priceToCross.quote.ticker}
`,
      );
    }

    const normalizedPriceToCross: Price =
      this.quote.assetId === priceToCross.base.assetId
        ? priceToCross
        : priceToCross.invert();

    if (
      this.base.assetId === priceToCross.base.assetId &&
      this.quote.assetId === priceToCross.quote.assetId
    ) {
      return this;
    }

    const newPriceAmount = math
      .evaluate(`${this.raw} * ${normalizedPriceToCross.raw}`)
      .toFixed();

    const newPrice = Price.new({
      base: this.base,
      quote: priceToCross.quote,
      value: newPriceAmount,
    });

    return newPrice.base.isAda() ? newPrice.invert() : newPrice;
  }

  /**
   * Returns true if assets of two prices are equals
   * @param {Price} price
   * @return {boolean}
   */
  isPriceAssetsEquals(
    price: Price | { base: AssetInfo; quote: AssetInfo },
  ): boolean {
    return (
      (this.base.isEquals(price.base) || this.quote.isEquals(price.base)) &&
      (this.quote.isEquals(price.base) || this.quote.isEquals(price.quote))
    );
  }

  /**
   * Returns true if current price greater than param
   * @param {Price} priceToCompare
   * @returns {boolean}
   */
  gt(priceToCompare: Price): boolean {
    if (!this.isPriceAssetsEquals(priceToCompare)) {
      throw new AssetInfoMismatchError(
        `
can't compare prices with different assets.
Expected that one assetInput of received price will be equal base or qoute asset of current price.
Current price: ${this.base.ticker} / ${this.quote.ticker}. Received ${priceToCompare.base.ticker} / ${priceToCompare.quote.ticker}
`,
      );
    }
    const normalizedPriceToCompare = priceToCompare.base.isEquals(this.base)
      ? priceToCompare
      : priceToCompare.invert();

    return Number(this.raw) > Number(normalizedPriceToCompare.raw);
  }

  /**
   * Creates new price like pct of current price
   * @param {number} pct
   * @return {Currency}
   */
  priceFromPct(pct: percent): Price {
    const newPriceRaw = math.evaluate(`${this.raw} / 100 * ${pct}`).toFixed();

    return Price.new({
      base: this.base,
      quote: this.quote,
      value: newPriceRaw,
    });
  }

  /**
   * Returns price number representation
   * @return {number}
   */
  toNumber(): number {
    return Number(this.toString());
  }

  /**
   * Returns price string representation
   * @return {string}
   */
  toString(): string {
    return math
      .evaluate(`${this.raw} / 10^${this.quote.decimals - this.base.decimals}`)
      .toFixed();
  }

  private assertCurrency(
    expected: AssetInfo,
    received: Currency | bigint,
    operationName: string,
  ): void {
    if (typeof received === 'bigint') {
      return;
    }
    if (expected.assetId !== received.asset.assetId) {
      throw new AssetInfoMismatchError(
        `can't execute ${operationName} operation with different asset info. Expected: ${expected.assetId}. Received: ${received.asset.assetId}`,
      );
    }
  }
}
