import { HexString, PoolId, uint } from '../../../types/types.ts';
import { CurrencyDescriptor } from './CurrencyDescriptor.ts';

export type RawSplashPoolVersion = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6';

export interface RawSplashPoolInfo {
  readonly id: PoolId;
  readonly x: CurrencyDescriptor;
  readonly y: CurrencyDescriptor;
  readonly lq: CurrencyDescriptor;
  readonly poolFeeNumX: string;
  readonly poolFeeNumY: string;
  readonly treasuryFee: string;
  readonly treasuryX: string;
  readonly treasuryY: string;
  readonly royaltyFee?: string;
  readonly royaltyX?: string;
  readonly royaltyY?: string;
  readonly verified: boolean;
  readonly outputId: {
    readonly transactionId: HexString;
    readonly transactionIndex: number;
  };
  readonly poolLqBound: string;
}

export interface RawSplashCfmmPoolInfo extends RawSplashPoolInfo {
  readonly poolType: 'cfmm';
  readonly version: RawSplashPoolVersion;
  readonly royaltyNonce?: uint;
  readonly royaltyPk?: HexString;
  readonly royaltyUserAddress?: HexString;
}

export interface RawSplashStablePoolInfo extends RawSplashPoolInfo {
  readonly poolType: 'stable';
}

export interface RawSplashWeightedPoolInfo extends RawSplashPoolInfo {
  readonly poolType: 'weighted';
  readonly xWeight: number;
  readonly yWeight: number;
}

export interface RawSplashPoolMetrics {
  readonly poolId: PoolId;
  readonly tvlAda?: number;
  readonly tvlUsd?: number;
  readonly volumeAda?: number;
  readonly volumeUsd?: number;
  readonly apr?: {
    readonly valueApr: number;
  };
  readonly apr30d?: {
    readonly valueApr: number;
  };
  readonly lpFeeAda?: number;
  readonly lpFeeUsd?: number;
}

export interface RawSplashCfmmPool {
  readonly pool: RawSplashCfmmPoolInfo;
  readonly metrics?: RawSplashPoolMetrics;
}

export interface RawSplashWeightedPool {
  readonly pool: RawSplashWeightedPoolInfo;
  readonly metrics?: RawSplashPoolMetrics;
}

export interface RawSplashStablePool {
  readonly pool: RawSplashStablePoolInfo;
  readonly metrics?: RawSplashPoolMetrics;
}
