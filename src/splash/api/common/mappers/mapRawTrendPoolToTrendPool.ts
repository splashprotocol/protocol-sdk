import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import { RawTrendPool } from '../../../../core/api/types/common/RawTrendPool.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { TrendPool } from '../types/TrendPool.ts';

export interface MapRawTrendPoolToTrendPoolConfig {
  readonly xMetadata?: AssetMetadata;
  readonly yMetadata?: AssetMetadata;
  readonly rawTrendPool: RawTrendPool;
}

export const mapRawTrendPoolToTrendPool = ({
  xMetadata,
  yMetadata,
  rawTrendPool,
}: MapRawTrendPoolToTrendPoolConfig): TrendPool => {
  const [xPolicyId, xBase16Name] = rawTrendPool.x.split('.');
  const [yPolicyId, yBase16Name] = rawTrendPool.y.split('.');

  const x = AssetInfo.new(
    {
      policyId: xPolicyId,
      name: xBase16Name,
      type: 'base16',
    },
    xMetadata,
  );
  const y = AssetInfo.new(
    {
      policyId: yPolicyId,
      name: yBase16Name,
      type: 'base16',
    },
    yMetadata,
  );

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
