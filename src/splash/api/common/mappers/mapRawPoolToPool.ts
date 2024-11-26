import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import {
  RawSplashCfmmPool,
  RawSplashStablePool,
  RawSplashWeightedPool,
} from '../../../../core/api/types/common/RawSplashPool.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { CfmmPool } from '../../../../core/models/pool/cfmm/CfmmPool.ts';
import { CfmmPoolType } from '../../../../core/models/pool/cfmm/common/CfmmPoolType.ts';
import { StablePool } from '../../../../core/models/pool/stable/StablePool.ts';
import { WeightedPool } from '../../../../core/models/pool/weighted/WeightedPool.ts';
import { math } from '../../../../core/utils/math/math.ts';
import { Splash } from '../../../splash.ts';

const mapVersionToCfmmType = (
  version: RawSplashCfmmPool['pool']['version'],
): CfmmPoolType => {
  switch (version) {
    case 'v4':
    case 'v5':
      return 'feeSwitch';
    case 'v3':
      return 'bidirectionalFees';
    case 'v6':
      return 'royalty';
    default:
      return 'default';
  }
};

export interface MapRawPoolToCfmmPoolConfig {
  readonly xMetadata?: AssetMetadata;
  readonly yMetadata?: AssetMetadata;
  readonly rawPool:
    | RawSplashCfmmPool
    | RawSplashWeightedPool
    | RawSplashStablePool;
}

export const mapRawPoolToPool = (
  { rawPool, xMetadata, yMetadata }: MapRawPoolToCfmmPoolConfig,
  splash: Splash<any>,
): CfmmPool | WeightedPool | StablePool => {
  const [nftPolicyId, nftBase16Name] = rawPool.pool.id.split('.');
  const [lqPolicyId, lqBase16Name] = rawPool.pool.lq.asset.split('.');
  const [xPolicyId, xBase16Name] = rawPool.pool.x.asset.split('.');
  const [yPolicyId, yBase16Name] = rawPool.pool.y.asset.split('.');
  //
  const nft = AssetInfo.new({
    policyId: nftPolicyId,
    name: nftBase16Name,
    type: 'base16',
  });
  const lq = AssetInfo.new({
    policyId: lqPolicyId,
    name: lqBase16Name,
    type: 'base16',
  });
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
    volumeADA: rawPool.metrics?.volumeAda,
    volumeUSD: rawPool.metrics?.volumeUsd,
    tvlADA: rawPool.metrics?.tvlAda,
    tvlUSD: rawPool.metrics?.tvlUsd,
    lpFeeADA: rawPool.metrics?.lpFeeAda,
    lpFeeUSD: rawPool.metrics?.lpFeeUsd,
  };

  if (rawPool.pool.poolType === 'cfmm') {
    return CfmmPool.new(
      {
        ...partialConfig,
        cfmmType: mapVersionToCfmmType(rawPool.pool.version),
        royaltyNonce: rawPool.pool.royaltyNonce,
        royaltyPk: rawPool.pool.royaltyPk,
        royaltyUserAddress: rawPool.pool.royaltyUserAddress,
        royaltyY: rawPool.pool.royaltyY
          ? BigInt(rawPool.pool.royaltyY)
          : undefined,
        royaltyX: rawPool.pool.royaltyX
          ? BigInt(rawPool.pool.royaltyX)
          : undefined,
        royaltyFee: rawPool.pool.royaltyFee
          ? BigInt(rawPool.pool.royaltyFee)
          : undefined,
      },
      splash,
    );
  }
  if (rawPool.pool.poolType === 'stable') {
    return StablePool.new(partialConfig, splash);
  }
  const stepPct = math
    .evaluate(`100 / (${rawPool.pool.xWeight} + ${rawPool.pool.yWeight})`)
    .toFixed();

  return WeightedPool.new(
    {
      ...partialConfig,
      xWeight: Number(stepPct) * rawPool.pool.xWeight,
      yWeight: Number(stepPct) * rawPool.pool.yWeight,
    },
    splash,
  );
};
