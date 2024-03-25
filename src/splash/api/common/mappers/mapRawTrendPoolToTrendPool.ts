import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import { RawTrendPool } from '../../../../core/api/types/common/RawTrendPool.ts';
import { ada } from '../../../../core/models/assetInfo/ada.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { usd } from '../../../../core/models/assetInfo/usd.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { toBigNumRepresentation } from '../../../../core/utils/math/math.ts';
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
    tvlAda: Currency.ada(
      toBigNumRepresentation(
        rawTrendPool.tvlAda.toFixed(ada.decimals),
        ada.decimals,
      ),
    ),
    tvlUsd: Currency.usd(
      toBigNumRepresentation(
        rawTrendPool.tvlUsd.toFixed(usd.decimals),
        usd.decimals,
      ),
    ),
    volumeAda: Currency.ada(
      toBigNumRepresentation(
        rawTrendPool.volumeAda.toFixed(ada.decimals),
        ada.decimals,
      ),
    ),
    volumeUsd: Currency.usd(
      toBigNumRepresentation(
        rawTrendPool.volumeUsd.toFixed(usd.decimals),
        usd.decimals,
      ),
    ),
  };
};
