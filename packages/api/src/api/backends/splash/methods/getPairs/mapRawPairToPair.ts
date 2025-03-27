import {
  AssetInfo,
  AssetInfoMetadata,
  Pair,
  Price,
} from '@splashprotocol/core';
import { RawPair } from './RawPair.ts';

export interface MapRawPairToPairConfig {
  readonly baseMetadata?: AssetInfoMetadata;
  readonly quoteMetadata?: AssetInfoMetadata;
  readonly rawPair: RawPair;
}

export const mapRawPairToPair = ({
  rawPair,
  quoteMetadata,
  baseMetadata,
}: MapRawPairToPairConfig): Pair => {
  const base = AssetInfo.fromAssetId(rawPair.base, baseMetadata);
  const quote = AssetInfo.fromAssetId(rawPair.quote, quoteMetadata);
  const spotPrice = Price.new({
    base,
    quote,
    value: rawPair.lastSpot,
  });
  const baseAdaPrice = Price.new({
    base,
    quote: AssetInfo.ada,
    value: rawPair.baseAdaRate,
  });
  const quoteAdaPrice = Price.new({
    base,
    quote: AssetInfo.ada,
    value: rawPair.quoteAdaRate,
  });

  const priceMinStep = Price.new({
    base,
    quote,
    value: rawPair.priceMinStep,
  });

  return Pair.new({
    base,
    quote,
    change: Number(rawPair.change),
    spotPrice,
    baseAdaPrice,
    quoteAdaPrice,
    priceMinStep,
  });
};
