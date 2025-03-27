import {
  AssetInfo,
  AssetInfoMetadata,
  Currency,
  Price,
} from '@splashprotocol/core';
import { RawRecentTrade } from './RawRecentTrade.ts';
import { RecentTrade } from '../../../../../types/RecentTrade.ts';

export interface MapRawRecentTradeToRecentTradeConfig {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly baseMetadata?: AssetInfoMetadata;
  readonly quoteMetadata?: AssetInfoMetadata;
  readonly rawRecentTrade: RawRecentTrade;
}

export const mapRawRecentTradeToRecentTrade = ({
  base,
  baseMetadata,
  quote,
  quoteMetadata,
  rawRecentTrade,
}: MapRawRecentTradeToRecentTradeConfig): RecentTrade => {
  const newBase = baseMetadata ? base.withMetadata(baseMetadata) : base;
  const newQuote = quoteMetadata ? quote.withMetadata(quoteMetadata) : quote;

  return {
    id: rawRecentTrade.entityId,
    side: rawRecentTrade.side,
    timestamp: rawRecentTrade.timestamp * 1_000,
    price: Price.new({
      value: rawRecentTrade.price,
      base: newBase,
      quote: newQuote,
    }),
    from:
      rawRecentTrade.side === 'sell'
        ? Currency.new(BigInt(rawRecentTrade.from), newBase)
        : Currency.new(BigInt(rawRecentTrade.from), newQuote),
    to:
      rawRecentTrade.side === 'sell'
        ? Currency.new(BigInt(rawRecentTrade.to), newQuote)
        : Currency.new(BigInt(rawRecentTrade.to), newBase),
  };
};
