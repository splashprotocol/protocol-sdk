import {
  math,
  normalizeAmount,
  toBigNumRepresentation,
  toNumberRepresentation,
} from '../../utils/math/math.ts';
import { ada } from '../assetInfo/ada.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { spf } from '../assetInfo/spf.ts';
import { usd } from '../assetInfo/usd.ts';
import { AssetInfoMismatchError } from './errors/AssetInfoMismatchError.ts';
import { ValueLowerThanZeroError } from './errors/ValueLowerThanZeroError.ts';

export class Currency {
  /**
   * Returns max currency of array
   * @param {Currency[]} currencies
   * @return {Currency}
   */
  static max(
    currencies:
      | [Currency, Currency]
      | [Currency, Currency, Currency]
      | [Currency, Currency, Currency, Currency]
      | [Currency, Currency, Currency, Currency, Currency],
  ): Currency {
    const [first] = currencies;

    if (!currencies.every((currency) => currency.asset.isEquals(first.asset))) {
      throw new AssetInfoMismatchError(
        `all currrencies should has same asset. expected ${first.asset.splashId}`,
      );
    }

    return currencies.reduce((max, currency) => {
      return max.gte(currency) ? max : currency;
    }, first.withAmount(0n));
  }

  /**
   * Creates currency instance with usd asset info
   * @param {bigint} amount
   * @returns {Currency}
   */
  static usd(amount: bigint): Currency {
    return new Currency(amount, usd);
  }

  /**
   * Creates currency instance with ada asset info
   * @param {bigint} amount
   * @returns {Currency}
   */
  static ada(amount: bigint): Currency {
    return new Currency(amount, ada);
  }

  /**
   * Creates currency instance with spf asset info
   * @param {bigint} amount
   * @returns {Currency}
   */
  static spf(amount: bigint): Currency {
    return new Currency(amount, spf);
  }

  /**
   * Creates currency instance with splash asset info
   * @param {bigint} amount
   * @returns {Currency}
   */
  static splash(amount: bigint): Currency {
    return new Currency(amount, AssetInfo.splash);
  }

  /**
   * Creates currency instance
   * @param {bigint} amount
   * @param {AssetInfo} assetInfo
   */
  static new(amount: bigint, assetInfo: AssetInfo) {
    return new Currency(amount, assetInfo);
  }

  private constructor(
    public amount: bigint,
    public asset: AssetInfo,
  ) {}

  /**
   * Creates new currency instance with specified amount and same assetInfo
   * @param {bigint} amount
   * @returns {Currency}
   */
  withAmount(amount: bigint): Currency {
    return new Currency(amount, this.asset);
  }

  /**
   * Returns true if amount is greater than 0
   * @returns {boolean}
   */
  isPositive(): boolean {
    return this.gt(0n);
  }

  /**
   * Returns true if current currency amount greater than param
   * @param {Currency | bigint} currency
   * @returns {boolean}
   */
  gt(currency: Currency | bigint): boolean {
    this.assertCurrency(currency, `compare (gt)`);

    if (typeof currency === 'bigint') {
      return this.amount > currency;
    } else {
      return this.amount > currency.amount;
    }
  }

  /**
   * Returns true if current currency amount greater or equals than param
   * @param {Currency | bigint} currency
   * @returns {boolean}
   */
  gte(currency: Currency | bigint): boolean {
    this.assertCurrency(currency, `compare (gte)`);

    if (typeof currency === 'bigint') {
      return this.amount >= currency;
    } else {
      return this.amount >= currency.amount;
    }
  }

  /**
   * Returns true if current currency amount lower than param
   * @param {Currency | bigint} currency
   * @returns {boolean}
   */
  lt(currency: Currency | bigint): boolean {
    this.assertCurrency(currency, `compare (lt)`);

    if (typeof currency === 'bigint') {
      return this.amount < currency;
    } else {
      return this.amount < currency.amount;
    }
  }

  /**
   * Returns true if current currency amount lower or equals than param
   * @param {Currency | bigint} currency
   * @returns {boolean}
   */
  lte(currency: Currency | bigint): boolean {
    this.assertCurrency(currency, `compare (lte)`);

    if (typeof currency === 'bigint') {
      return this.amount <= currency;
    } else {
      return this.amount <= currency.amount;
    }
  }

  /**
   * Returns true if current currency amount equals params
   * @param {Currency | bigint} currency
   * @returns {bigint}
   */
  eq(currency: Currency | bigint): boolean {
    this.assertCurrency(currency, `compare (eq)`);

    if (typeof currency === 'bigint') {
      return this.amount === currency;
    } else {
      return this.amount === currency.amount;
    }
  }

  /**
   * sum two currency with same assetInfo
   * @param {bigint | Currency} currency
   * @returns {Currency}
   */
  plus(currency: bigint | Currency): Currency {
    this.assertCurrency(currency, 'sum');
    if (typeof currency === 'bigint') {
      return this.withAmount(this.amount + currency);
    }
    return this.withAmount(this.amount + currency.amount);
  }

  /**
   * multiplies current currency to coefficient
   * @param {bigint} coefficient
   * @return {Currency}
   */
  multiply(coefficient: bigint): Currency {
    return this.withAmount(this.amount * coefficient);
  }

  /**
   * subtract param from current currency amount with same asset info
   * @param {bigint | Currency} currency
   * @returns {Currency}
   */
  minus(currency: bigint | Currency): Currency {
    this.assertCurrency(currency, 'minus');

    const amountToMinus: bigint =
      typeof currency === 'bigint' ? currency : currency.amount;

    if (this.gte(amountToMinus)) {
      return this.withAmount(this.amount - amountToMinus);
    }

    throw new ValueLowerThanZeroError(
      `result of minus is lower than 0. ${this.asset.subject}`,
    );
  }

  /**
   * Returns true if asset info is ada
   */
  isAda(): boolean {
    return this.asset.isAda();
  }

  /**
   * calculates percent of current amount
   * @param {number} pct
   * @returns {Currency}
   */
  amountFromPercent(pct: number): Currency {
    if (this.amount === 0n) {
      return this;
    }
    const fmtAmount = this.toString();
    const newAmount = math.evaluate(`${fmtAmount} / 100 * ${pct}`).toFixed();

    return new Currency(
      toBigNumRepresentation(
        normalizeAmount(newAmount, this.asset.decimals),
        this.asset.decimals,
      ),
      this.asset,
    );
  }

  /**
   * calculates percent with equals received amount
   * @param {Currency | bigint} amount
   * @returns {Currency}
   */
  percentFromAmount(amount: bigint | Currency): number {
    this.assertCurrency(amount, 'percentFromAmount');
    if (this.amount === 0n) {
      return 0;
    }
    const fmtAmount = this.toString();
    const percent = math
      .evaluate(`${amount.toString()} * 100 / ${fmtAmount}`)
      .toFixed(3);

    return Number(percent);
  }

  /**
   * Returns string representation of Currency
   */
  toString(): string {
    return toNumberRepresentation(this.amount, this.asset.decimals);
  }

  /**
   * Returns number representation of Currency
   */
  toNumber(): number {
    return Number(this.toString());
  }

  private assertCurrency(
    currency: Currency | bigint,
    operationName: string,
  ): void {
    if (typeof currency === 'bigint') {
      return;
    }
    if (this.asset.subject !== currency.asset.subject) {
      throw new AssetInfoMismatchError(
        `can't ${operationName} currencies with different asset info. ${this.asset.splashId} and ${currency.asset.splashId}`,
      );
    }
  }
}
