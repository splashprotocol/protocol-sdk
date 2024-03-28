import { Api } from '../../../core/api/Api.ts';
import { AssetMetadata } from '../../../core/api/types/common/AssetMetadata.ts';
import { GetAssetMetadataResponse } from '../../../core/api/types/getAssetMetadata/getAssetMetadata.ts';
import { GetAssetsMetadataResponse } from '../../../core/api/types/getAssetsMetadata/getAssetsMetadata.ts';
import {
  GetOrderBookParams,
  GetOrderBookResponse,
} from '../../../core/api/types/getOrderBook/getOrderBook.ts';
import { GetPairsResponse } from '../../../core/api/types/getPairs/getPairs.ts';
import {
  GetPoolFeesChartParams,
  GetPoolFeesChartResponse,
} from '../../../core/api/types/getPoolFeesChart/getPoolFeesChart.ts';
import {
  GetPoolTvlChartParams,
  GetPoolTvlChartResponse,
} from '../../../core/api/types/getPoolTvlChart/getPoolTvlChart.ts';
import {
  GetPoolVolumeChartParams,
  GetPoolVolumeChartResponse,
} from '../../../core/api/types/getPoolVolumeChart/getPoolVolumeChart.ts';
import { GetProtocolStatsResponse } from '../../../core/api/types/getProtocolStats/getProtocolStats.ts';
import {
  GetSplashPoolsParams,
  GetSplashPoolsResponse,
} from '../../../core/api/types/getSplashPools/getSplashPools.ts';
import { GetTrendPoolsResponse } from '../../../core/api/types/getTrendPools/getTrendPools.ts';
import { ada } from '../../../core/models/assetInfo/ada.ts';
import { Network } from '../../../core/types/Network.ts';
import { ProtocolParams } from '../../../core/types/ProtocolParams.ts';
import { AssetId, Dictionary } from '../../../core/types/types.ts';
import { RawProtocolParams } from './types/RawProtocolParams.ts';

const mapNetworkToUrl: { [key in Network]: string } = {
  mainnet: 'https://api.splash.trade/platform-api/v1/',
  preprod: 'https://test-api9.spectrum.fi/v1/',
  preview: 'https://test-api9.spectrum.fi/v1/',
};

export class SplashApi implements Api {
  /**
   * Create splash api instance using network name
   * @param {ProtocolParams["network"]} network
   * @returns {SplashApi}
   */
  static new(network: ProtocolParams['network']): SplashApi {
    return new SplashApi(network);
  }

  private get url() {
    return mapNetworkToUrl[this.network];
  }
  private constructor(public network: ProtocolParams['network']) {}

  async getTrendPools(): Promise<GetTrendPoolsResponse> {
    return fetch(`http://195.201.9.29:8091/v1/pools/trended`).then((res) =>
      res.json(),
    );
  }

  async getOrderBook({
    base,
    quote,
  }: GetOrderBookParams): Promise<GetOrderBookResponse> {
    return fetch(
      `http://195.201.9.29:8091/v1/trading-view/order-book?base=${base.splashId}&quote=${quote.splashId}`,
    ).then((res) => res.json());
  }

  async getPairs(): Promise<GetPairsResponse> {
    return fetch(`http://195.201.9.29:8091/v2/trading-view/pair-list`).then(
      (res) => res.json(),
    );
  }

  /**
   * Returns all protocol stats
   * @returns {Promise<GetProtocolStatsResponse>}
   */
  async getProtocolStats(): Promise<GetProtocolStatsResponse> {
    return fetch(`${this.url}platform/stats`).then((res) => res.json());
  }

  /**
   * Returns all splash DEx liquidity pools
   * @param {GetSplashPoolsParams | undefined} params
   * @returns {Promise<GetSplashPoolsResponse>}
   */
  async getSplashPools(
    params?: GetSplashPoolsParams,
  ): Promise<GetSplashPoolsResponse> {
    const duplicated = params?.duplicated || true;
    const verified = params?.verified || true;

    return fetch(
      `${this.url}pools/overview?verified=${verified}&duplicated=${duplicated}`,
    ).then((res) => res.json());
  }

  /**
   * Returns all available assets metadata
   * @returns {Promise<GetAssetsMetadataResponse>}
   */
  async getAssetsMetadata(): Promise<GetAssetsMetadataResponse> {
    return fetch('https://spectrum.fi/cardano-token-list.json')
      .then((res) => res.json())
      .then((data) => data.tokens)
      .then((assets: AssetMetadata[]) =>
        assets.reduce<Dictionary<AssetMetadata>>(
          (acc, asset) => ({
            ...acc,
            [asset.subject
              ? [
                  asset.subject.slice(0, 56),
                  asset.subject.slice(56, asset.subject.length),
                ].join('.')
              : '.']: {
              ...asset,
              logo: asset.logo ? `https://spectrum.fi${asset.logo}` : undefined,
            },
          }),
          {
            [ada.splashId]: {
              subject: ada.subject,
              decimals: ada.decimals,
              description: ada.description,
              ticker: ada.ticker,
              name: ada.name,
              policyId: ada.policyId,
              logo: '',
            },
          },
        ),
      );
  }

  /**
   * Returns asset metadata by asset id
   * @param {AssetId} assetId
   * @returns {Promise<GetAssetMetadataResponse>}
   */

  /**
   * Returns tvl chart points by poolId and interval
   * @param {string} poolId
   * @param {"d30" | "d60" | "d90"} interval
   * @return {Promise<GetPoolTvlChartResponse>}
   */
  async getPoolTvlChart({
    poolId,
    interval,
  }: GetPoolTvlChartParams): Promise<GetPoolTvlChartResponse> {
    return fetch(
      `http://195.201.9.29:8091/v1/pool/tvl/chart?poolId=${poolId}&interval=${interval}`,
    ).then((res) => res.json());
  }

  /**
   * Returns volume chart points by poolId and interval
   * @param {string} poolId
   * @param {"d30" | "d60" | "d90"} interval
   * @return {Promise<GetPoolVolumeChartResponse>}
   */
  async getPoolVolumeChart({
    poolId,
    interval,
  }: GetPoolVolumeChartParams): Promise<GetPoolVolumeChartResponse> {
    return fetch(
      `http://195.201.9.29:8091/v1/pool/volume/chart?poolId=${poolId}&interval=${interval}`,
    ).then((res) => res.json());
  }

  /**
   * Returns fees chart points by poolId and interval
   * @param {string} poolId
   * @param {"d30" | "d60" | "d90"} interval
   * @return {Promise<GetPoolFeesChartResponse>}
   */
  async getPoolFeesChart({
    poolId,
    interval,
  }: GetPoolFeesChartParams): Promise<GetPoolFeesChartResponse> {
    return fetch(
      `http://195.201.9.29:8091/v1/pool/fee/chart?poolId=${poolId}&interval=${interval}`,
    ).then((res) => res.json());
  }

  async getAssetMetadata(assetId: AssetId): Promise<GetAssetMetadataResponse> {
    return this.getAssetsMetadata().then((assetsMetadata) => {
      return assetsMetadata[assetId];
    });
  }

  async getProtocolParams(): Promise<ProtocolParams> {
    return fetch(
      `https://explorer.spectrum.fi/cardano/${this.network}/v1/networkParams`,
    )
      .then((res) => res.json())
      .then((res) => res.pparams)
      .then((data: RawProtocolParams) => ({
        network: this.network,
        protocolVersion: data.protocolVersion,
        collateralPercentage: data.collateralPercentage,
        maxCollateralInputs: data.maxCollateralInputs,
        maxTxExecutionUnits: {
          memory: BigInt(data.maxTxExecutionUnits.memory),
          steps: BigInt(data.maxTxExecutionUnits.steps),
        },
        executionUnitPrices: {
          priceMemory: data.executionUnitPrices.priceMemory,
          priceSteps: data.executionUnitPrices.priceSteps,
        },
        costModels: data.costModels,
        coinsPerUtxoByte: BigInt(data.coinsPerUtxoByte),
        maxTxSize: BigInt(data.maxTxSize),
        txFeeFixed: BigInt(data.txFeeFixed),
        txFeePerByte: BigInt(data.txFeePerByte),
        minUTxOValue: BigInt(data.minUTxOValue),
        maxValueSize: BigInt(data.maxValueSize),
      }));
  }
}
