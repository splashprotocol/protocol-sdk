import { Api } from '../../../core/api/Api.ts';
import { AssetMetadata } from '../../../core/api/types/common/AssetMetadata.ts';
import { GetAdaUsdRateResult } from '../../../core/api/types/getAdaUsdRate/getAdaUsdRate.ts';
import { GetAssetMetadataResponse } from '../../../core/api/types/getAssetMetadata/getAssetMetadata.ts';
import { GetAssetsMetadataResponse } from '../../../core/api/types/getAssetsMetadata/getAssetsMetadata.ts';
import {
  GetLiquidityOrdersParams,
  GetLiquidityOrdersResult,
} from '../../../core/api/types/getLiquidityOrders/getLiquidityOrders.ts';
import {
  GetOrderBookParams,
  GetOrderBookResponse,
} from '../../../core/api/types/getOrderBook/getOrderBook.ts';
import {
  GetOrdersMempoolParams,
  GetOrdersMempoolResult,
} from '../../../core/api/types/getOrdersMempool/getOrdersMempool.ts';
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
import {
  GetTradeOrdersParams,
  GetTradeOrdersResult,
} from '../../../core/api/types/getTradeOrders/getTradeOrders.ts';
import { GetTrendPoolsResponse } from '../../../core/api/types/getTrendPools/getTrendPools.ts';
import {
  GetUTxOByRefParams,
  GetUTxOByRefResult,
} from '../../../core/api/types/getUTxOByRef/getUTxOByRef.ts';
import { ada } from '../../../core/models/assetInfo/ada.ts';
import { Network } from '../../../core/types/Network.ts';
import { NetworkContext } from '../../../core/types/NetworkContext.ts';
import { ProtocolParams } from '../../../core/types/ProtocolParams.ts';
import { AssetId, Dictionary } from '../../../core/types/types.ts';
import { RawProtocolParams } from './types/RawProtocolParams.ts';

type ExtendedNetwork = Network | 'premainnet';

const mapNetworkToUrl: { [key in ExtendedNetwork]: string } = {
  mainnet: 'https://api2.splash.trade/platform-api/v1/',
  preprod: 'https://api-test-preprod.splash.trade/v1/',
  preview: 'https://test-api9.spectrum.fi/v1/',
  premainnet: 'https://api-test-mainnet.splash.trade/v1/',
};

export class SplashApi implements Api {
  /**
   * Create splash api instance using network name
   * @param {ProtocolParams["network"]} network
   * @returns {SplashApi}
   */
  static new(network: ExtendedNetwork): SplashApi {
    return new SplashApi(network);
  }

  public readonly network: Network;

  private get url() {
    return mapNetworkToUrl[this._network];
  }
  private constructor(private _network: ExtendedNetwork) {
    this.network = this._network === 'premainnet' ? 'mainnet' : this._network;
  }

  async getTrendPools(): Promise<GetTrendPoolsResponse> {
    return fetch(`${this.url}pools/trended`).then((res) => res.json());
  }

  async getOrderBook({
    base,
    quote,
  }: GetOrderBookParams): Promise<GetOrderBookResponse> {
    return fetch(
      `${this.url}trading-view/order-book?base=${base.splashId}&quote=${quote.splashId}`,
    ).then((res) => res.json());
  }

  async getPairs(): Promise<GetPairsResponse> {
    return fetch(`${this.url}trading-view/pair-list`).then((res) => res.json());
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
    const verified = params?.verified === undefined ? true : params?.verified;

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
              verified: true,
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
   * @param {poolType} poolType
   * @return {Promise<GetPoolTvlChartResponse>}
   */
  async getPoolTvlChart({
    poolId,
    interval,
    poolType,
  }: GetPoolTvlChartParams): Promise<GetPoolTvlChartResponse> {
    return fetch(
      `${this.url}pool/tvl/chart?poolId=${poolId}&interval=${interval}&poolType=${poolType}`,
    )
      .then((res) => res.json())
      .then((data) =>
        data.map((item) => ({ ...item, timestamp: item.timestamp * 1_000 })),
      );
  }

  /**
   * Returns current ada usd rate
   * @return {Promise<GetAdaUsdRateResult>}
   */
  async getAdaUsdRate(): Promise<GetAdaUsdRateResult> {
    return fetch(`${this.url}ada-usd/rate`)
      .then((res) => res.json())
      .then((rate) => Number(rate));
  }

  /**
   * Returns volume chart points by poolId and interval
   * @param {string} poolId
   * @param {"d30" | "d60" | "d90"} interval
   * @param {poolType} poolType
   * @return {Promise<GetPoolVolumeChartResponse>}
   */
  async getPoolVolumeChart({
    poolId,
    interval,
    poolType,
  }: GetPoolVolumeChartParams): Promise<GetPoolVolumeChartResponse> {
    return fetch(
      `${this.url}pool/volume/chart?poolId=${poolId}&interval=${interval}&poolType=${poolType}`,
    )
      .then((res) => res.json())
      .then((data) =>
        data.map((item) => ({ ...item, timestamp: item.timestamp * 1_000 })),
      );
  }

  /**
   * Returns fees chart points by poolId and interval
   * @param {string} poolId
   * @param {"d30" | "d60" | "d90"} interval
   * @param {poolType} poolType
   * @return {Promise<GetPoolFeesChartResponse>}
   */
  async getPoolFeesChart({
    poolId,
    interval,
    poolType,
  }: GetPoolFeesChartParams): Promise<GetPoolFeesChartResponse> {
    return fetch(
      `${this.url}pool/fee/chart?poolId=${poolId}&interval=${interval}&poolType=${poolType}`,
    )
      .then((res) => res.json())
      .then((data) =>
        data.map((item) => ({ ...item, timestamp: item.timestamp * 1_000 })),
      );
  }

  async getAssetMetadata(assetId: AssetId): Promise<GetAssetMetadataResponse> {
    return this.getAssetsMetadata().then((assetsMetadata) => {
      return assetsMetadata[assetId];
    });
  }

  async getNetworkContext(): Promise<NetworkContext> {
    return fetch(
      `https://explorer.spectrum.fi/cardano/mainnet/v1/blocks/bestBlock`,
    ).then((res) => res.json());
  }

  async getProtocolParams(): Promise<ProtocolParams> {
    return fetch(
      `https://explorer.spectrum.fi/cardano/${this.network}/v1/networkParams`,
    )
      .then((res) => res.json())
      .then((res) => res.pparams)
      .then(
        (data: RawProtocolParams): ProtocolParams => ({
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
          maxTxSize: data.maxTxSize,
          poolDeposit: BigInt(data.stakePoolDeposit),
          keyDeposit: BigInt(data.stakeAddressDeposit),
          txFeeFixed: BigInt(data.txFeeFixed),
          txFeePerByte: BigInt(data.txFeePerByte),
          minUTxOValue: BigInt(data.minUTxOValue),
          maxValueSize: data.maxValueSize,
        }),
      );
  }

  async getTradeOrders({
    limit,
    paymentKeyHashes,
    offset,
  }: GetTradeOrdersParams): Promise<GetTradeOrdersResult> {
    return fetch(
      `${this.url}history/order/trades?limit=${limit}&offset=${offset}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(paymentKeyHashes),
      },
    ).then((res) => res.json());
  }

  async getLiquidityOrders({
    limit,
    paymentKeyHashes,
    offset,
  }: GetLiquidityOrdersParams): Promise<GetLiquidityOrdersResult> {
    return fetch(
      `${this.url}history/order?limit=${limit}&offset=${offset}&entityTypeFilter=AnyLiquidityOps`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(paymentKeyHashes),
      },
    ).then((res) => res.json());
  }

  async getOrdersMempool({
    paymentKeyHashes,
  }: GetOrdersMempoolParams): Promise<GetOrdersMempoolResult> {
    const url =
      this.network === 'preprod'
        ? 'https://api-test-preprod.splash.trade/mempool/v2/mempool/orders'
        : 'https://api2.splash.trade/mempool/v2/mempool/orders';

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(paymentKeyHashes),
    }).then((res) => res.json());
  }

  async getUTxOByRef(params: GetUTxOByRefParams): Promise<GetUTxOByRefResult> {
    return fetch(
      `https://explorer.spectrum.fi/cardano/${this.network}/v1/outputs/${params.txHash}:${params.index}`,
    )
      .then((res) => (res.status === 404 ? undefined : res.json()))
      .catch(() => undefined);
  }
}
