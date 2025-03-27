import { AnyRawPool, RawSplashCfmmPool } from './RawSplashPool.ts';
import {
  AssetInfo,
  AssetInfoMetadata,
  CfmmPool,
  CfmmPoolType,
  Currency,
  math,
  StablePool,
  WeightedPool,
} from '@splashprotocol/core';
import { AnyPool } from '../../../../../types/AnyPool.ts';

const mapVersionToCfmmType = (
  version: RawSplashCfmmPool['pool']['version'],
): CfmmPoolType => {
  switch (version) {
    case 'v4':
    case 'v5':
      return 'feeSwitch';
    case 'v3':
      return 'bidirectionalFees';
    default:
      return 'default';
  }
};

export interface MapRawPoolToCfmmPoolConfig {
  readonly xMetadata?: AssetInfoMetadata;
  readonly yMetadata?: AssetInfoMetadata;
  readonly rawPool: AnyRawPool;
}

export const mapRawPoolToPool = ({
  rawPool,
  xMetadata,
  yMetadata,
}: MapRawPoolToCfmmPoolConfig): AnyPool => {
  const nft = AssetInfo.fromAssetId(rawPool.pool.id);
  const lq = AssetInfo.fromAssetId(rawPool.pool.lq.asset);
  const x = AssetInfo.fromAssetId(rawPool.pool.x.asset, xMetadata);
  const y = AssetInfo.fromAssetId(rawPool.pool.y.asset, yMetadata);

  const partialConfig = {
    outputId: {
      txHash: rawPool.pool.outputId.transactionId,
      index: BigInt(rawPool.pool.outputId.transactionIndex),
    },
    nft,
    lq: Currency.new(BigInt(rawPool.pool.lq.amount), lq),
    totalX: Currency.new(BigInt(rawPool.pool.x.amount), x),
    totalY: Currency.new(BigInt(rawPool.pool.y.amount), y),
    treasuryX: rawPool.pool.treasuryX
      ? BigInt(rawPool.pool.treasuryX)
      : undefined,
    treasuryY: rawPool.pool.treasuryY
      ? BigInt(rawPool.pool.treasuryY)
      : undefined,
    treasuryFee: rawPool.pool.treasuryFee
      ? BigInt(rawPool.pool.treasuryFee)
      : undefined,
    xFee: BigInt(rawPool.pool.poolFeeNumX),
    yFee: BigInt(rawPool.pool.poolFeeNumY),
    apr: rawPool.metrics?.apr?.valueApr,
    apr30d: rawPool.metrics?.apr30d?.valueApr,
    volumeADA: rawPool.metrics?.volumeAda
      ? BigInt(rawPool.metrics?.volumeAda)
      : undefined,
    volumeUSD: rawPool.metrics?.volumeUsd
      ? BigInt(rawPool.metrics?.volumeUsd)
      : undefined,
    tvlADA: rawPool.metrics?.tvlAda
      ? BigInt(rawPool.metrics?.tvlAda)
      : undefined,
    tvlUSD: rawPool.metrics?.tvlUsd
      ? BigInt(rawPool.metrics?.tvlUsd)
      : undefined,
    lpFeeADA: rawPool.metrics?.lpFeeAda
      ? BigInt(rawPool.metrics?.lpFeeAda)
      : undefined,
    lpFeeUSD: rawPool.metrics?.lpFeeUsd
      ? BigInt(rawPool.metrics?.lpFeeUsd)
      : undefined,
  };

  if (rawPool.pool.poolType === 'cfmm') {
    return CfmmPool.new({
      ...partialConfig,
      cfmmType: mapVersionToCfmmType(rawPool.pool.version),
    });
  }
  if (rawPool.pool.poolType === 'stable') {
    return StablePool.new(partialConfig);
  }
  const stepPct = math
    .evaluate(`100 / (${rawPool.pool.xWeight} + ${rawPool.pool.yWeight})`)
    .toFixed();

  return WeightedPool.new({
    ...partialConfig,
    xWeight: Number(stepPct) * rawPool.pool.xWeight,
    yWeight: Number(stepPct) * rawPool.pool.yWeight,
  });
};
