import {
  AssetInfo,
  AssetInfoMetadata,
  Currency,
  Price,
} from '@splashprotocol/core';
import { RawTradeOrder } from './RawTradeOrder.ts';
import { TradeOrder } from '../../../../../types/TradeOrder.ts';

export interface MapRawTradeOrderToTradeOrderConfig {
  readonly inputMetadata?: AssetInfoMetadata;
  readonly outputMetadata?: AssetInfoMetadata;
  readonly rawTradeOrder: RawTradeOrder;
}
export const mapRawTradeOrderToTradeOrder = ({
  inputMetadata,
  outputMetadata,
  rawTradeOrder,
}: MapRawTradeOrderToTradeOrderConfig): TradeOrder => {
  const input = Currency.new(
    BigInt(rawTradeOrder.inputAmount),
    AssetInfo.fromAssetId(rawTradeOrder.input, inputMetadata),
  );

  const output = Currency.new(
    BigInt(rawTradeOrder.outputAmount),
    AssetInfo.fromAssetId(rawTradeOrder.output, outputMetadata),
  );
  const [orderTransactionId] = rawTradeOrder.pendingTxId.split(':');

  return {
    operation: 'trade',
    input,
    output,
    status:
      rawTradeOrder.orderStatus === 'mempool'
        ? rawTradeOrder.evalTxId
          ? 'open'
          : 'mempool'
        : rawTradeOrder.orderStatus,
    price: Price.new({
      base: output.asset,
      quote: input.asset,
      value: rawTradeOrder.price,
    }),
    orderTxHash: orderTransactionId,
    orderReferenceHash: rawTradeOrder.pendingTxId,
    latestPendingReferenceHash: rawTradeOrder.latestPendingTxId,
    orderTimestamp: rawTradeOrder.pendingTx * 1_000,
    filled: rawTradeOrder.filled,
    lastTxTimestamp: rawTradeOrder.evaluatedTx
      ? rawTradeOrder.evaluatedTx * 1_000
      : undefined,
    lastTxHash: rawTradeOrder.evalTxId,
  };
};
