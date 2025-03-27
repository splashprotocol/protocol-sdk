import {
  lts,
  OutputReferenceHash,
  TransactionHash,
} from '@splashprotocol/core';

export type LiquidityOrderStatus =
  | 'Pending'
  | 'Evaluated'
  | 'Cancelled'
  | 'mempool';

export interface LiquidityOrder {
  /**
   * Status of liquidity order
   * @type {LiquidityOrderStatus}
   */
  readonly status: LiquidityOrderStatus;

  /**
   * Order output ref hash in ${txHash}:${index} format
   * @type {OutputReferenceHash}
   */
  readonly orderOutputReference: OutputReferenceHash;

  /**
   * Transaction hash of order tx
   * @type {TransactionHash}
   */
  readonly orderTxHash: TransactionHash;

  /**
   * Timestamp in milliseconds of order tx
   * @type {lts}
   */
  readonly orderTxTimestamp: lts;

  /**
   * Transaction hash of batcher tx
   * @type {TransactionHash}
   */
  readonly evaluatedTxHash?: TransactionHash;

  /**
   * Timestamp in milliseconds of batcher tx
   * @type {lts}
   */
  readonly evaluatedTxTimestamp?: lts;
}
