import { AssetInfo, AssetInfoMetadata, Currency } from '@splashprotocol/core';
import { RawTrendPool } from './RawTrendPool.ts';
import { TrendPool } from '../../../../../types/TrendPool.ts';

export interface MapRawTrendPoolToTrendPoolConfig {
  readonly xMetadata?: AssetInfoMetadata;
  readonly yMetadata?: AssetInfoMetadata;
  readonly rawTrendPool: RawTrendPool;
}

export const mapRawTrendPoolToTrendPool = ({
  xMetadata,
  yMetadata,
  rawTrendPool,
}: MapRawTrendPoolToTrendPoolConfig): TrendPool => {
  const x = AssetInfo.fromAssetId(rawTrendPool.x, xMetadata);
  const y = AssetInfo.fromAssetId(rawTrendPool.y, yMetadata);

  return {
    poolId: rawTrendPool.poolId,
    x,
    y,
    apr: rawTrendPool.apr,
    aprTrend: rawTrendPool.aprTrend,
    tvlAda: Currency.ada(BigInt(rawTrendPool.tvlAda)),
    tvlUsd: Currency.usd(BigInt(rawTrendPool.tvlUsd)),
    volumeAda: Currency.ada(BigInt(rawTrendPool.volumeAda)),
    volumeUsd: Currency.usd(BigInt(rawTrendPool.volumeUsd)),
  };
};
