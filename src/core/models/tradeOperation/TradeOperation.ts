import { Splash } from '../../../splash/splash.ts';
import {
  lts,
  OutputReferenceHash,
  percent,
  TransactionHash,
} from '../../types/types.ts';
import { Currency } from '../currency/Currency.ts';
import { Price } from '../price/Price.ts';

export enum TradeOperationStatus {
  Open = 'open',
  Close = 'close',
  Pending = 'pending',
}
export interface TradeOperationConfig {
  readonly status: TradeOperationStatus;
  readonly input: Currency;
  readonly currentOutput: Currency;
  readonly price: Price;
  readonly filled: percent;
  readonly orderTransactionId: TransactionHash;
  readonly orderId: OutputReferenceHash;
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
   * Trade operation input currency
   * @type {Currency}
   */
  readonly input: Currency;

  /**
   * Trade operation output currency
   * @type {Currency}
   */
  readonly output: Currency;

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
   * Trade operation current pending tx id
   * @type {TransactionHash}
   */
  readonly orderTransactionId: TransactionHash;

  /**
   * Trade operation current pending tx box
   * @type {TransactionHash}
   */
  readonly orderId: OutputReferenceHash;

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
      input,
      currentOutput,
      price,
      filled,
      status,
      orderTransactionId,
      lastTransactionId,
      orderTimestamp,
      lastTransactionTimestamp,
      orderId,
    }: TradeOperationConfig,
    splash: Splash<{}>,
  ) {
    this.splash = splash;
    this.input = input;
    this.output = currentOutput;
    this.price = price;
    this.filled = filled;
    this.status = status;
    this.orderTransactionId = orderTransactionId;
    this.lastTransactionId = lastTransactionId;
    this.orderTimestamp = orderTimestamp;
    this.orderId = orderId;
    this.lastTransactionTimestamp = lastTransactionTimestamp;
  }

  /**
   * It cancels current order
   * @return {Promise<TransactionHash>}
   */
  async cancel(): Promise<TransactionHash> {
    return this.splash
      .newTx()
      .cancelOperation(this.orderId)
      .complete()
      .then((tx) => tx.signAndSubmit());
  }
}
