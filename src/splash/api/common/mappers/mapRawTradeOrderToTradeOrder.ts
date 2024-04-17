import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import { RawTradeOperation } from '../../../../core/api/types/common/RawTradeOperation.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Price } from '../../../../core/models/price/Price.ts';
import { TradeOperation } from '../../../../core/models/tradeOperation/TradeOperation.ts';
import { Splash } from '../../../splash.ts';

export interface MapRawTradeOrderToTradeOrderConfig {
  readonly inputMetadata?: AssetMetadata;
  readonly outputMetadata?: AssetMetadata;
  readonly rawTradeOrder: RawTradeOperation;
}
export const mapRawTradeOrderToTradeOrder = (
  {
    inputMetadata,
    outputMetadata,
    rawTradeOrder,
  }: MapRawTradeOrderToTradeOrderConfig,
  splash: Splash<{}>,
): TradeOperation => {
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

  return TradeOperation.new(
    {
      input,
      currentOutput: output,
      status: rawTradeOrder.orderStatus,
      price: Price.new({
        base: output.asset,
        quote: input.asset,
        raw: Number(rawTradeOrder.price),
      }),
      orderTransactionId: orderTransactionId,
      orderId: rawTradeOrder.pendingTxId,
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
