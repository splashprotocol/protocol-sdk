import { PoolId } from '../../../types/types.ts';
import { CurrencyDescriptor } from './CurrencyDescriptor.ts';

export type RawSplashPoolVersion = 'v1' | 'v2' | 'v3' | 'v4';

export interface RawSplashPoolInfo {
  readonly poolType: 'cfmm';
  readonly id: PoolId;
  readonly x: CurrencyDescriptor;
  readonly y: CurrencyDescriptor;
  lq: CurrencyDescriptor;
  readonly poolFeeNumX: string;
  readonly poolFeeNumY: string;
  readonly treasuryFee: string;
  readonly treasuryX: string;
  readonly treasuryY: string;
  readonly verified: boolean;
  readonly poolLqBound: string;
  readonly version: RawSplashPoolVersion;
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
  readonly lpFeeAda?: number;
  readonly lpFeeUsd?: number;
}

export interface RawSplashPool {
  readonly pool: RawSplashPoolInfo;
  readonly metrics?: RawSplashPoolMetrics;
}
