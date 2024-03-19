import { AssetId } from '../types/types.ts';
import { GetAssetMetadataResponse } from './types/getAssetMetadata/getAssetMetadata.ts';
import { GetAssetsMetadataResponse } from './types/getAssetsMetadata/getAssetsMetadata.ts';
import { GetProtocolStatsResponse } from './types/getProtocolStats/getProtocolStats.ts';
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

  getAssetsMetadata(): Promise<GetAssetsMetadataResponse>;

  getAssetMetadata(assetId: AssetId): Promise<GetAssetMetadataResponse>;

  getProtocolStats(): Promise<GetProtocolStatsResponse>;
}
