import { Splash } from '../../../../splash/splash.ts';
import {
  lts,
  OutputReferenceHash,
  TransactionHash,
  ts,
} from '../../../types/types.ts';
import { LiquidityOrderStatus } from './LiquidityOrderStatus.ts';

export interface LiquidityOrderConfig {
  readonly orderId: OutputReferenceHash;
  readonly status: LiquidityOrderStatus;
  readonly orderTxId: TransactionHash;
  readonly orderTxTimestamp: ts;
  readonly evaluatedTxId?: TransactionHash;
  readonly evaluatedTxTimestamp?: ts;
}
export class LiquidityOrder {
  /**
   * Status of liquidity order
   * @type {LiquidityOrderStatus}
   */
  readonly status: LiquidityOrderStatus;

  /**
   * Order output ref hash in ${txHash}:${index} format
   * @type {OutputReferenceHash}
   */
  readonly orderId: OutputReferenceHash;

  /**
   * Transaction hash of order tx
   * @type {TransactionHash}
   */
  readonly orderTxId: TransactionHash;

  /**
   * Timestamp in milliseconds of order tx
   * @type {lts}
   */
  readonly orderTxTimestamp: lts;

  /**
   * Transaction hash of batcher tx
   * @type {TransactionHash}
   */
  readonly evaluatedTxId?: TransactionHash;

  /**
   * Timestamp in milliseconds of batcher tx
   * @type {lts}
   */
  readonly evaluatedTxTimestamp?: lts;

  /**
   * Splash client instance
   * @type {Splash<{}>}
   */
  readonly splash: Splash<{}>;

  protected constructor(
    {
      orderId,
      orderTxTimestamp,
      orderTxId,
      evaluatedTxId,
      evaluatedTxTimestamp,
      status,
    }: LiquidityOrderConfig,
    splash: Splash<{}>,
  ) {
    this.status = status;
    this.orderId = orderId;
    this.orderTxTimestamp = orderTxTimestamp;
    this.orderTxId = orderTxId;
    this.evaluatedTxId = evaluatedTxId;
    this.evaluatedTxTimestamp = evaluatedTxTimestamp;
    this.splash = splash;
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
