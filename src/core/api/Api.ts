import { AssetId } from '../types/types.ts';
import { GetAssetMetadataResponse } from './types/getAssetMetadata/getAssetMetadata.ts';
import { GetAssetsMetadataResponse } from './types/getAssetsMetadata/getAssetsMetadata.ts';
import {
  GetOrderBookParams,
  GetOrderBookResponse,
} from './types/getOrderBook/getOrderBook.ts';
import { GetPairsResponse } from './types/getPairs/getPairs.ts';
import {
  GetPoolFeesChartParams,
  GetPoolFeesChartResponse,
} from './types/getPoolFeesChart/getPoolFeesChart.ts';
import {
  GetPoolTvlChartParams,
  GetPoolTvlChartResponse,
} from './types/getPoolTvlChart/getPoolTvlChart.ts';
import {
  GetPoolVolumeChartParams,
  GetPoolVolumeChartResponse,
} from './types/getPoolVolumeChart/getPoolVolumeChart.ts';
import { GetProtocolStatsResponse } from './types/getProtocolStats/getProtocolStats.ts';
import {
  GetSplashPoolsParams,
  GetSplashPoolsResponse,
} from './types/getSplashPools/getSplashPools.ts';
import { GetTrendPoolsResponse } from './types/getTrendPools/getTrendPools.ts';

/**
 *
 */
export interface Api {
  getTrendPools(): Promise<GetTrendPoolsResponse>;

  getPoolTvlChart(
    params: GetPoolTvlChartParams,
  ): Promise<GetPoolTvlChartResponse>;

  getPoolVolumeChart(
    params: GetPoolVolumeChartParams,
  ): Promise<GetPoolVolumeChartResponse>;

  getPoolFeesChart(
    params: GetPoolFeesChartParams,
  ): Promise<GetPoolFeesChartResponse>;

  getSplashPools<P extends GetSplashPoolsParams = GetSplashPoolsParams>(
    params?: P,
  ): Promise<GetSplashPoolsResponse>;

  getAssetsMetadata(): Promise<GetAssetsMetadataResponse>;

  getAssetMetadata(assetId: AssetId): Promise<GetAssetMetadataResponse>;

  getProtocolStats(): Promise<GetProtocolStatsResponse>;

  getPairs(): Promise<GetPairsResponse>;

  getOrderBook(params: GetOrderBookParams): Promise<GetOrderBookResponse>;
}
