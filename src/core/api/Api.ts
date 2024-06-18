import { NetworkContext } from '../types/NetworkContext.ts';
import { ProtocolParams } from '../types/ProtocolParams.ts';
import { AssetId } from '../types/types.ts';
import { GetAdaUsdRateResult } from './types/getAdaUsdRate/getAdaUsdRate.ts';
import { GetAssetMetadataResponse } from './types/getAssetMetadata/getAssetMetadata.ts';
import { GetAssetsMetadataResponse } from './types/getAssetsMetadata/getAssetsMetadata.ts';
import {
  GetChartHistoryParams,
  GetChartHistoryResult,
} from './types/getChartHistory/getChartHistory.ts';
import {
  GetChartLastBarParams,
  GetChartLastBarResult,
} from './types/getChartLastBar/getChartLastBar.ts';
import {
  GetLiquidityOrdersParams,
  GetLiquidityOrdersResult,
} from './types/getLiquidityOrders/getLiquidityOrders.ts';
import {
  GetOrderBookParams,
  GetOrderBookResponse,
} from './types/getOrderBook/getOrderBook.ts';
import {
  GetOrdersMempoolParams,
  GetOrdersMempoolResult,
} from './types/getOrdersMempool/getOrdersMempool.ts';
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
import {
  GetTradeOrdersParams,
  GetTradeOrdersResult,
} from './types/getTradeOrders/getTradeOrders.ts';
import { GetTrendPoolsResponse } from './types/getTrendPools/getTrendPools.ts';
import {
  GetUTxOByRefParams,
  GetUTxOByRefResult,
} from './types/getUTxOByRef/getUTxOByRef.ts';

/**
 *
 */
export interface Api {
  getChartLastBar(
    params: GetChartLastBarParams,
  ): Promise<GetChartLastBarResult>;

  getChartHistory(
    params: GetChartHistoryParams,
  ): Promise<GetChartHistoryResult>;

  getProtocolParams(): Promise<ProtocolParams>;

  getNetworkContext(): Promise<NetworkContext>;

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

  getTradeOrders(params: GetTradeOrdersParams): Promise<GetTradeOrdersResult>;

  getOrdersMempool(
    params: GetOrdersMempoolParams,
  ): Promise<GetOrdersMempoolResult>;

  getLiquidityOrders(
    params: GetLiquidityOrdersParams,
  ): Promise<GetLiquidityOrdersResult>;

  getAdaUsdRate(): Promise<GetAdaUsdRateResult>;

  getUTxOByRef(ref: GetUTxOByRefParams): Promise<GetUTxOByRefResult>;
}
