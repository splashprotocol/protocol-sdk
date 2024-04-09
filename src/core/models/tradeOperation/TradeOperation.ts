import { Splash } from '../../../splash/splash.ts';
import { lts, percent, TransactionHash } from '../../types/types.ts';
import { Currency } from '../currency/Currency.ts';
import { Price } from '../price/Price.ts';

export enum TradeOperationStatus {
  Open = 'open',
  Close = 'close',
  Pending = 'pending',
}
export interface TradeOperationConfig {
  readonly status: TradeOperationStatus;
  readonly base: Currency;
  readonly currentQuote: Currency;
  readonly price: Price;
  readonly filled: percent;
  readonly orderId: TransactionHash;
  readonly lastTransactionId?: TransactionHash;
  readonly orderTimestamp: lts;
  readonly lastTransactionTimestamp?: lts;
}

/**
 * Trade operation representation in history
 */
export class TradeOperation {
  /**
   * Creates new Trade operation
   * @param {TradeOperationConfig} config
   * @param {Splash<{}>} splash
   */
  static new(config: TradeOperationConfig, splash: Splash<{}>) {
    return new TradeOperation(config, splash);
  }

  /**
   * Splash instance
   * @type {Splash<{}>}
   */
  readonly splash: Splash<{}>;

  /**
   * Trade operation base currency
   * @type {Currency}
   */
  readonly base: Currency;

  /**
   * Trade operation base currency
   * @type {Currency}
   */
  readonly quote: Currency;

  /**
   * Trade operation price
   * @type {Price}
   */
  readonly price: Price;

  /**
   * Trade operation filled percent
   * @type {percent}
   */
  readonly filled: percent;

  /**
   * Trade operation status
   * @type {TradeOperationStatus}
   */
  readonly status: TradeOperationStatus;

  /**
   * Trade operation first transaction id
   * @type {TransactionHash}
   */
  readonly orderId: TransactionHash;

  /**
   * Trade operation last evaluated transaction id
   * @type {TransactionHash}
   */
  readonly lastTransactionId?: TransactionHash;

  /**
   * Trade operation order timestamp in milliseconds
   * @type {lts}
   */
  readonly orderTimestamp: lts;

  /**
   * Trade operation last transaction timestamp in milliseconds. Will be undefined if order totally unfilled
   * @type {lts}
   */
  readonly lastTransactionTimestamp?: lts;

  private constructor(
    {
      base,
      currentQuote,
      price,
      filled,
      status,
      orderId,
      lastTransactionId,
      orderTimestamp,
      lastTransactionTimestamp,
    }: TradeOperationConfig,
    splash: Splash<{}>,
  ) {
    this.splash = splash;
    this.base = base;
    this.quote = currentQuote;
    this.price = price;
    this.filled = filled;
    this.status = status;
    this.orderId = orderId;
    this.lastTransactionId = lastTransactionId;
    this.orderTimestamp = orderTimestamp;
    this.lastTransactionTimestamp = lastTransactionTimestamp;
  }

  /**
   * It cancels current order
   * @return {Promise<TransactionHash>}
   */
  async cancel(): Promise<TransactionHash> {
    return Promise.resolve('');
  }
}
