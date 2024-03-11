import { AssetId } from '../types/types.ts';
import { GetAssetMetadataResponse } from './types/getAssetMetadata/getAssetMetadata.ts';
import {
  GetSplashPoolsParams,
  GetSplashPoolsResponse,
} from './types/getSplashPools/getSplashPools.ts';

/**
 *
 */
export interface Api {
  getSplashPools<P extends GetSplashPoolsParams = GetSplashPoolsParams>(
    params?: P,
  ): Promise<GetSplashPoolsResponse>;

  getAssetMetadata(assetId: AssetId): Promise<GetAssetMetadataResponse>;
}
