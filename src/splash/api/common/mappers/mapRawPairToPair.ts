import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import { RawPair } from '../../../../core/api/types/common/RawPair.ts';
import { ada } from '../../../../core/models/assetInfo/ada.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Pair } from '../../../../core/models/pair/Pair.ts';
import { Price } from '../../../../core/models/price/Price.ts';

export interface MapRawPairToPairConfig {
  readonly baseMetadata?: AssetMetadata;
  readonly quoteMetadata?: AssetMetadata;
  readonly rawPair: RawPair;
}

export const mapRawPairToPair = ({
  rawPair,
  quoteMetadata,
  baseMetadata,
}: MapRawPairToPairConfig): Pair => {
  const [basePolicyId, baseBase16Name] = rawPair.base.split('.');
  const [quotePolicyId, quoteBase16Name] = rawPair.quote.split('.');

  const base = AssetInfo.new(
    {
      policyId: basePolicyId,
      name: baseBase16Name,
      type: 'base16',
    },
    baseMetadata,
  );
  const quote = AssetInfo.new(
    {
      policyId: quotePolicyId,
      name: quoteBase16Name,
      type: 'base16',
    },
    quoteMetadata,
  );
  const spotPrice = Price.new({
    base,
    quote,
    raw: rawPair.lastSpot,
  });
  const baseAdaPrice = Price.new({
    base,
    quote: ada,
    raw: rawPair.baseAdaRate,
  });
  const quoteAdaPrice = Price.new({
    base,
    quote: ada,
    raw: rawPair.quoteAdaRate,
  });

  const priceMinStep = Price.new({
    base,
    quote: ada,
    raw: rawPair.priceMinStep,
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
