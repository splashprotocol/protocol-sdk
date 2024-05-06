import { percent } from '../../types/types.ts';
import {
  math,
  normalizeAmount,
  toBigNumRepresentation,
} from '../../utils/math/math.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { Currency } from '../currency/Currency.ts';
import { AssetInfoMismatchError } from '../currency/errors/AssetInfoMismatchError.ts';

export interface PriceParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly raw: number;
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
  public readonly raw: number;

  private constructor({ base, quote, raw }: PriceParams) {
    this.base = base;
    this.quote = quote;
    this.raw = raw;
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
      raw: Number(invertedRawPrice),
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

    const amountOfQuoteCurrency = toBigNumRepresentation(
      normalizeAmount(
        math.evaluate(`${this.raw} * ${baseCurrency.toString()}`).toFixed(),
        this.quote.decimals,
      ),
      this.quote.decimals,
    );

    return Currency.new(amountOfQuoteCurrency, this.quote);
  }

  /**
   * Method expects currency with quoteCurrency asset
   * and returns how much base currency do you received for specified quote
   * @param {Currency | bigint} quoteCurrency
   * @return Currency
   */
  getReceivedBaseFor(quoteCurrency: Currency | bigint): Currency {
    this.assertCurrency(this.quote, quoteCurrency, '"getReceivedBaseFor"');

    if (!this.raw) {
      return Currency.new(0n, this.base);
    }

    const amountOfBaseCurrency = toBigNumRepresentation(
      normalizeAmount(
        math.evaluate(`${quoteCurrency.toString()} / ${this.raw}`).toFixed(),
        this.base.decimals,
      ),
      this.base.decimals,
    );

    return Currency.new(amountOfBaseCurrency, this.base);
  }

  /**
   * Returns cross price. SFP/ADA * ADA/SPLASH = SPF/SPLASH / SFP/ADA * SPLASH/ADA = SPF/SPLASH
   * @param {Price} priceToCross
   * @return {Price}
   */
  cross(priceToCross: Price): Price {
    if (
      this.base.splashId !== priceToCross.base.splashId &&
      this.base.splashId !== priceToCross.quote.splashId &&
      this.quote.splashId !== priceToCross.base.splashId &&
      this.quote.splashId !== priceToCross.quote.splashId
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
      this.quote.splashId === priceToCross.base.splashId
        ? priceToCross
        : priceToCross.invert();

    if (
      this.base.splashId === priceToCross.base.splashId &&
      this.quote.splashId === priceToCross.quote.splashId
    ) {
      return this;
    }

    const newPriceAmount = math.evaluate(
      `${this.raw} * ${normalizedPriceToCross.raw}`,
    );

    const newPrice = Price.new({
      base: this.base,
      quote: priceToCross.quote,
      raw: Number(newPriceAmount),
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
   * Creates new price like pct of current price
   * @param {number} pct
   * @return {Currency}
   */
  priceFromPct(pct: percent): Price {
    const newPriceRaw = math.evaluate(`${this.raw} / 100 * ${pct}`).toFixed();

    return Price.new({
      base: this.base,
      quote: this.quote,
      raw: Number(newPriceRaw),
    });
  }

  /**
   * Returns price string representation
   * @return {string}
   */
  toString(): string {
    const fractions = this.raw.toString().split('.')[1];
    if (!fractions) {
      return this.raw.toString();
    }

    const firstPositiveFraction =
      fractions.split('').findIndex((fraction) => fraction !== '0') + 1;
    if (!firstPositiveFraction) {
      return this.raw.toString();
    }

    return normalizeAmount(
      this.raw.toString(),
      Math.max(this.quote.decimals, firstPositiveFraction),
    );
  }

  private assertCurrency(
    expected: AssetInfo,
    received: Currency | bigint,
    operationName: string,
  ): void {
    if (typeof received === 'bigint') {
      return;
    }
    if (expected.splashId !== received.asset.splashId) {
      throw new AssetInfoMismatchError(
        `can't execute ${operationName} operation with different asset info. Expected: ${expected.splashId}. Received: ${received.asset.splashId}`,
      );
    }
  }
}
