import {
  Currency,
  lts,
  OutputReferenceHash,
  percent,
  Price,
  TransactionHash,
} from '@splashprotocol/core';

export type TradeOrderStatus =
  | 'open'
  | 'closed'
  | 'partiallyClosed'
  | 'cancelled'
  | 'mempool';

export interface TradeOrder {
  /**
   * Operation type
   */
  readonly operation: 'trade';

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
   * @type {TradeOrderStatus}
   */
  readonly status: TradeOrderStatus;

  /**
   * Trade operation current pending tx hash
   * @type {TransactionHash}
   */
  readonly orderTxHash: TransactionHash;

  /**
   * Trade operation current pending tx box
   * @type {OutputReferenceHash}
   */
  readonly orderReferenceHash: OutputReferenceHash;

  /**
   * Trade operation latest box
   * @type {OutputReferenceHash}
   */
  readonly latestPendingReferenceHash: OutputReferenceHash;

  /**
   * Trade operation last evaluated transaction hash
   * @type {TransactionHash}
   */
  readonly lastTxHash?: TransactionHash;

  /**
   * Trade operation order timestamp in milliseconds
   * @type {lts}
   */
  readonly orderTimestamp: lts;

  /**
   * Trade operation last transaction timestamp in milliseconds. Will be undefined if order totally unfilled
   * @type {lts}
   */
  readonly lastTxTimestamp?: lts;
}
