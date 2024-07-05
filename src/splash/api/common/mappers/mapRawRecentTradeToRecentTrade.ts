import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import { RawRecentTrade } from '../../../../core/api/types/common/RawRecentTrade.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Price } from '../../../../core/models/price/Price.ts';
import { RecentTrade } from '../../../../core/models/recentTrade/RecentTrade.ts';

export interface MapRawRecentTradeToRecentTradeConfig {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly baseMetadata?: AssetMetadata;
  readonly quoteMetadata?: AssetMetadata;
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
    side: rawRecentTrade.side,
    timestamp: rawRecentTrade.timestamp,
    price: Price.new({
      raw: rawRecentTrade.price,
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
