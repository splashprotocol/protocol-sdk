import { Api } from '../../../core/api/Api.ts';
import { AssetMetadata } from '../../../core/api/types/common/AssetMetadata.ts';
import { GetAssetMetadataResponse } from '../../../core/api/types/getAssetMetadata/getAssetMetadata.ts';
import {
  GetSplashPoolsParams,
  GetSplashPoolsResponse,
} from '../../../core/api/types/getSplashPools/getSplashPools.ts';
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

  private assetsMetadataPromise: Promise<Dictionary<AssetMetadata>> | undefined;

  private constructor(public network: ProtocolParams['network']) {}

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
   * Returns asset metadata by asset id
   * @param {AssetId} assetId
   * @returns {Promise<GetAssetMetadataResponse>}
   */
  async getAssetMetadata(assetId: AssetId): Promise<GetAssetMetadataResponse> {
    if (!this.assetsMetadataPromise) {
      this.assetsMetadataPromise = fetch(
        'https://spectrum.fi/cardano-token-list.json',
      )
        .then((res) => res.json())
        .then((data) => data.tokens)
        .then((assets: AssetMetadata[]) =>
          assets.reduce<Dictionary<AssetMetadata>>(
            (acc, asset) => ({
              ...acc,
              [assetId]: asset,
            }),
            {},
          ),
        );
    }

    return this.assetsMetadataPromise!.then((assetsMetadata) => {
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
