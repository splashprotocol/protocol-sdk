import { TradeOperationStatus } from '../../../models/tradeOrder/TradeOrder.ts';
import { AssetId, percent, TransactionHash, ts } from '../../../types/types.ts';

export interface RawTradeOrder {
  readonly orderStatus: TradeOperationStatus;
  readonly pendingTxId: TransactionHash;
  readonly evalTxId?: TransactionHash;
  readonly input: AssetId;
  readonly output: AssetId;
  readonly pendingTx: ts;
  readonly evaluatedTx?: ts;
  readonly inputAmount: string;
  readonly outputAmount: string;
  readonly price: string;
  readonly filled: percent;
}
