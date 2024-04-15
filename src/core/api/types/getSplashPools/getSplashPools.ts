import {
  RawSplashCfmmPool,
  RawSplashWeightedPool,
} from '../common/RawSplashPool.ts';

export interface GetSplashPoolsParams {
  readonly duplicated: boolean;
  readonly verified: boolean;
}

export type GetSplashPoolsResponse = (
  | RawSplashCfmmPool
  | RawSplashWeightedPool
)[];
