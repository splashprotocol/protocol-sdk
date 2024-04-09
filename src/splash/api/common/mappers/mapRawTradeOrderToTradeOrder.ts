import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import { RawTradeOperation } from '../../../../core/api/types/common/RawTradeOperation.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Price } from '../../../../core/models/price/Price.ts';
import { TradeOperation } from '../../../../core/models/tradeOperation/TradeOperation.ts';
import { Splash } from '../../../splash.ts';

export interface MapRawTradeOrderToTradeOrderConfig {
  readonly baseMetadata?: AssetMetadata;
  readonly quoteMetadata?: AssetMetadata;
  readonly rawTradeOrder: RawTradeOperation;
}
export const mapRawTradeOrderToTradeOrder = (
  {
    baseMetadata,
    quoteMetadata,
    rawTradeOrder,
  }: MapRawTradeOrderToTradeOrderConfig,
  splash: Splash<{}>,
): TradeOperation => {
  const [basePolicyId, baseBase16Name] = rawTradeOrder.base.split('.');
  const [quotePolicyId, quoteBase16Name] = rawTradeOrder.quote.split('.');

  const base = Currency.new(
    BigInt(rawTradeOrder.baseAmount),
    AssetInfo.new(
      {
        policyId: basePolicyId,
        name: baseBase16Name,
        type: 'base16',
      },
      baseMetadata,
    ),
  );

  const quote = Currency.new(
    BigInt(rawTradeOrder.quoteAmount),
    AssetInfo.new(
      {
        policyId: quotePolicyId,
        name: quoteBase16Name,
        type: 'base16',
      },
      quoteMetadata,
    ),
  );

  return TradeOperation.new(
    {
      base,
      currentQuote: quote,
      status: rawTradeOrder.orderStatus,
      price: Price.new({
        base: base.asset,
        quote: quote.asset,
        raw: Number(rawTradeOrder.price),
      }),
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
