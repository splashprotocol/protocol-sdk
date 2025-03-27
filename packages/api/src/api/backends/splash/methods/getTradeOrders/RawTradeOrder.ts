import {
  AssetId,
  Bech32String,
  OutputReferenceHash,
  percent,
  TransactionHash,
  ts,
} from '@splashprotocol/core';
import { TradeOrderStatus } from '../../../../../types/TradeOrder.ts';

export interface RawTradeOrder {
  readonly address: Bech32String;
  readonly orderType: 'spot';
  readonly orderStatus: TradeOrderStatus;
  readonly pendingTxId: TransactionHash;
  readonly evalTxId?: TransactionHash;
  readonly input: AssetId;
  readonly output: AssetId;
  readonly pendingTx: ts;
  readonly evaluatedTx?: ts;
  readonly inputAmount: string;
  readonly outputAmount: string;
  readonly price: string;
  readonly latestPendingTxId: OutputReferenceHash;
  readonly filled: percent;
}
