import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import { RawSplashPool } from '../../../../core/api/types/common/RawSplashPool.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { CfmmPool } from '../../../../core/models/pool/cfmm/CfmmPool.ts';
import { CfmmPoolType } from '../../../../core/models/pool/cfmm/common/CfmmPoolType.ts';
import { Splash } from '../../../splash.ts';

const mapVersionToCfmmType = (
  version: RawSplashPool['pool']['version'],
): CfmmPoolType => {
  switch (version) {
    case 'v4':
      return 'feeSwitch';
    case 'v3':
      return 'bidirectionalFees';
    default:
      return 'default';
  }
};

export interface MapRawPoolToCfmmPoolConfig {
  readonly xMetadata?: AssetMetadata;
  readonly yMetadata?: AssetMetadata;
  readonly rawCfmmPool: RawSplashPool;
}

export const mapRawPoolToCfmmPool = (
  { rawCfmmPool, xMetadata, yMetadata }: MapRawPoolToCfmmPoolConfig,
  splash: Splash<any>,
): CfmmPool => {
  const [nftPolicyId, nftBase16Name] = rawCfmmPool.pool.id.split('.');
  const [lqPolicyId, lqBase16Name] = rawCfmmPool.pool.lq.asset.split('.');
  const [xPolicyId, xBase16Name] = rawCfmmPool.pool.x.asset.split('.');
  const [yPolicyId, yBase16Name] = rawCfmmPool.pool.y.asset.split('.');
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

  return CfmmPool.new(
    {
      nft,
      lq: Currency.new(BigInt(rawCfmmPool.pool.lq.amount), lq),
      totalX: Currency.new(BigInt(rawCfmmPool.pool.x.amount), x),
      totalY: Currency.new(BigInt(rawCfmmPool.pool.y.amount), y),
      treasuryX: rawCfmmPool.pool.treasuryX
        ? BigInt(rawCfmmPool.pool.treasuryX)
        : undefined,
      treasuryY: rawCfmmPool.pool.treasuryY
        ? BigInt(rawCfmmPool.pool.treasuryY)
        : undefined,
      treasuryFee: rawCfmmPool.pool.treasuryFee
        ? BigInt(rawCfmmPool.pool.treasuryFee)
        : undefined,
      cfmmType: mapVersionToCfmmType(rawCfmmPool.pool.version),
      xFee: BigInt(rawCfmmPool.pool.poolFeeNumX),
      yFee: BigInt(rawCfmmPool.pool.poolFeeNumY),
      apr: rawCfmmPool.metrics?.apr?.valueApr,
      volumeADA: rawCfmmPool.metrics?.volumeAda,
      volumeUSD: rawCfmmPool.metrics?.volumeUsd,
      tvlADA: rawCfmmPool.metrics?.tvlAda,
      tvlUSD: rawCfmmPool.metrics?.tvlUsd,
    },
    splash,
  );
};
