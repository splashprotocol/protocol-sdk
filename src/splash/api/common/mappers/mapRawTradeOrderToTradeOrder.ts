import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import { RawTradeOrder } from '../../../../core/api/types/common/RawTradeOrder.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Price } from '../../../../core/models/price/Price.ts';
import { TradeOrder } from '../../../../core/models/tradeOrder/TradeOrder.ts';
import { Splash } from '../../../splash.ts';

export interface MapRawTradeOrderToTradeOrderConfig {
  readonly inputMetadata?: AssetMetadata;
  readonly outputMetadata?: AssetMetadata;
  readonly rawTradeOrder: RawTradeOrder;
}
export const mapRawTradeOrderToTradeOrder = (
  {
    inputMetadata,
    outputMetadata,
    rawTradeOrder,
  }: MapRawTradeOrderToTradeOrderConfig,
  splash: Splash<{}>,
): TradeOrder => {
  const [inputPolicyId, inputBase16Name] = rawTradeOrder.input.split('.');
  const [outputPolicyId, outputBase16Name] = rawTradeOrder.output.split('.');

  const input = Currency.new(
    BigInt(rawTradeOrder.inputAmount),
    AssetInfo.new(
      {
        policyId: inputPolicyId,
        name: inputBase16Name,
        type: 'base16',
      },
      inputMetadata,
    ),
  );

  const output = Currency.new(
    BigInt(rawTradeOrder.outputAmount),
    AssetInfo.new(
      {
        policyId: outputPolicyId,
        name: outputBase16Name,
        type: 'base16',
      },
      outputMetadata,
    ),
  );
  const [orderTransactionId] = rawTradeOrder.pendingTxId.split(':');

  return TradeOrder.new(
    {
      input,
      currentOutput: output,
      status:
        rawTradeOrder.orderStatus === 'mempool'
          ? rawTradeOrder.evalTxId
            ? 'open'
            : 'mempool'
          : rawTradeOrder.orderStatus,
      price: Price.new({
        base: output.asset,
        quote: input.asset,
        raw: Number(rawTradeOrder.price),
      }),
      orderTransactionId: orderTransactionId,
      orderId: rawTradeOrder.pendingTxId,
      latestPendingOrderId: rawTradeOrder.latestPendingTxId,
      orderTimestamp: rawTradeOrder.pendingTx * 1_000,
      filled: rawTradeOrder.filled,
      lastTransactionTimestamp: rawTradeOrder.evaluatedTx
        ? rawTradeOrder.evaluatedTx * 1_000
        : undefined,
      lastTransactionId: rawTradeOrder.evalTxId,
    },
    splash,
  );
};
