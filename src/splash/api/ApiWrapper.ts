import { Address, NetworkId } from '@dcspark/cardano-multiplatform-lib-browser';

import { Api } from '../../core/api/Api.ts';
import { AssetMetadata } from '../../core/api/types/common/AssetMetadata.ts';
import { PoolChartPoint } from '../../core/api/types/common/PoolChartPoint.ts';
import { GetOrderBookParams } from '../../core/api/types/getOrderBook/getOrderBook.ts';
import { GetPoolFeesChartParams } from '../../core/api/types/getPoolFeesChart/getPoolFeesChart.ts';
import { GetPoolTvlChartParams } from '../../core/api/types/getPoolTvlChart/getPoolTvlChart.ts';
import { GetPoolVolumeChartParams } from '../../core/api/types/getPoolVolumeChart/getPoolVolumeChart.ts';
import { GetSplashPoolsParams } from '../../core/api/types/getSplashPools/getSplashPools.ts';
import { AssetInfo } from '../../core/models/assetInfo/AssetInfo.ts';
import { Currencies } from '../../core/models/currencies/Currencies.ts';
import { Pair } from '../../core/models/pair/Pair.ts';
import { CfmmPool } from '../../core/models/pool/cfmm/CfmmPool.ts';
import { CardanoCIP30WalletContext } from '../../core/types/CardanoCIP30WalletBridge.ts';
import { Dictionary } from '../../core/types/types.ts';
import { Splash } from '../splash.ts';
import { InvalidWalletNetworkError } from './common/errors/InvalidWalletNetworkError.ts';
import { NoWalletError } from './common/errors/NoWalletError.ts';
import { WalletApiError } from './common/errors/WalletApiError.ts';
import { WalletEnablingError } from './common/errors/WalletEnablingError.ts';
import { mapRawOrderBookToOrderBook } from './common/mappers/mapRawOrderBookToOrderBook.ts';
import { mapRawPairToPair } from './common/mappers/mapRawPairToPair.ts';
import { mapRawPoolToCfmmPool } from './common/mappers/mapRawPoolToCfmmPool.ts';
import { mapRawProtocolStatsToProtocolStats } from './common/mappers/mapRawProtocolStatsToProtocolStats.ts';
import { mapRawTrendPoolToTrendPool } from './common/mappers/mapRawTrendPoolToTrendPool.ts';
import { OrderBook } from './common/types/OrderBook.ts';
import { ProtocolStats } from './common/types/ProtocolStats.ts';
import { TrendPool } from './common/types/TrendPool.ts';

export interface MetadataConfig {
  // Update time in milliseconds: Default 300_000
  readonly updateTime: number;
  // Default metadata value. Field will be useful with ssr
  readonly defaultValue?:
    | Dictionary<AssetMetadata>
    | Promise<Dictionary<AssetMetadata>>;
}

const DEFAULT_UPDATE_TIME = 300_000;

export class ApiWrapper {
  private contextPromise: Promise<CardanoCIP30WalletContext> | undefined;

  private assetsMetadataCache: Promise<Dictionary<AssetMetadata>> | undefined;

  private assetsMetadataLastUpdateTime?: number;

  private includeMetadata: boolean;

  private metadataUpdateTime: number;

  constructor(
    private splash: Splash<any>,
    private api: Api,
    metadataConfig?: MetadataConfig | boolean,
  ) {
    const normalizedMetadataConfig = this.normalizeConfig(metadataConfig);

    if (!normalizedMetadataConfig) {
      this.includeMetadata = false;
      this.metadataUpdateTime = DEFAULT_UPDATE_TIME;
      return;
    }

    this.includeMetadata = true;
    this.metadataUpdateTime = normalizedMetadataConfig.updateTime;

    if (normalizedMetadataConfig.defaultValue) {
      this.assetsMetadataLastUpdateTime = Date.now();
      this.assetsMetadataCache =
        normalizedMetadataConfig.defaultValue instanceof Promise
          ? normalizedMetadataConfig.defaultValue
          : Promise.resolve(normalizedMetadataConfig.defaultValue);
    } else {
      this.getAssetsMetadata();
    }
  }

  /**
   * Returns tvl chart points by poolId and interval
   * @param {GetPoolTvlChartParams} params
   * @return {Promise<{asset: AssetInfo, data: PoolChartPoint[]}>}
   */
  async getPoolTvlChart(params: GetPoolTvlChartParams): Promise<{
    asset: AssetInfo;
    data: PoolChartPoint[];
  }> {
    return this.api.getPoolTvlChart(params).then((data) => ({
      asset: AssetInfo.ada,
      data,
    }));
  }

  /**
   * Returns volume chart points by poolId and interval
   * @param {GetPoolVolumeChartParams} params
   * @return {Promise<{asset: AssetInfo, data: PoolChartPoint[]}>}
   */
  async getPoolVolumeChart(params: GetPoolVolumeChartParams): Promise<{
    asset: AssetInfo;
    data: PoolChartPoint[];
  }> {
    return this.api.getPoolVolumeChart(params).then((data) => ({
      asset: AssetInfo.ada,
      data,
    }));
  }

  /**
   * Returns fees chart points by poolId and interval
   * @param {GetPoolFeesChartParams} params
   * @return {Promise<{asset: AssetInfo, data: PoolChartPoint[]}>}
   */
  async getPoolFeesChart(params: GetPoolFeesChartParams): Promise<{
    asset: AssetInfo;
    data: PoolChartPoint[];
  }> {
    return this.api.getPoolFeesChart(params).then((data) => ({
      asset: AssetInfo.ada,
      data,
    }));
  }

  /**
   * Returns active wallet address
   * @return {Promise<string>}
   */
  async getActiveAddress(): Promise<string> {
    return this.getWalletContext()
      .then((ctx) => this.handleCIP30WalletError(ctx.getChangeAddress()))
      .then((cborAddressHex) => Address.from_hex(cborAddressHex).to_bech32());
  }

  /**
   * Returns current order book by pair
   * @param {GetOrderBookParams} params
   * @return {Promise<OrderBook>}
   */
  async getOrderBook(params: GetOrderBookParams): Promise<OrderBook> {
    return Promise.all([
      this.api.getOrderBook(params),
      this.getAssetsMetadata(),
    ]).then(([orderBook, metadata]) => {
      return mapRawOrderBookToOrderBook({
        rawOrderBook: orderBook,
        baseMetadata: metadata[orderBook.pair.base],
        quoteMetadata: metadata[orderBook.pair.quote],
      });
    });
  }

  /**
   * Returns 5 top trading pool info
   * @return {Promise<TrendPool[]>}
   */
  async getTrendPools(): Promise<TrendPool[]> {
    return Promise.all([
      this.api.getTrendPools(),
      this.getAssetsMetadata(),
    ]).then(([trendPools, metadata]) => {
      return trendPools.map((rawTrendPool) =>
        mapRawTrendPoolToTrendPool({
          rawTrendPool,
          xMetadata: metadata[rawTrendPool.x],
          yMetadata: metadata[rawTrendPool.y],
        }),
      );
    });
  }

  /**
   * Returns available pair list
   * @return {Promise<Pair[]>}
   */
  async getPairs(): Promise<Pair[]> {
    return Promise.all([this.api.getPairs(), this.getAssetsMetadata()]).then(
      ([pools, metadata]) => {
        return pools.map((rawPair) =>
          mapRawPairToPair({
            rawPair,
            baseMetadata: metadata[rawPair.base],
            quoteMetadata: metadata[rawPair.quote],
          }),
        );
      },
    );
  }

  /**
   * Returns protocol stats
   * @return {Promise<ProtocolStats>}
   */
  async getProtocolStats(): Promise<ProtocolStats> {
    return this.api.getProtocolStats().then(mapRawProtocolStatsToProtocolStats);
  }

  /**
   * Returns current wallet balance
   * @returns {Promise<Currencies>}
   */
  async getBalance(): Promise<Currencies> {
    return Promise.all([
      this.getAssetsMetadata(),
      this.getWalletContext().then((ctx) =>
        this.handleCIP30WalletError(ctx.getBalance()),
      ),
    ]).then(([metadata, cborBalance]) => {
      return Currencies.new(cborBalance, metadata);
    });
  }

  /**
   * Returns all available assets metadata
   * @returns {Promise<AssetMetadata>}
   */
  getAssetsMetadata(): Promise<Dictionary<AssetMetadata>> {
    if (!this.includeMetadata) {
      return Promise.resolve({});
    }
    const timeToUpdate = this.assetsMetadataLastUpdateTime
      ? Date.now() - this.assetsMetadataLastUpdateTime > this.metadataUpdateTime
      : true;

    if (!this.assetsMetadataCache || timeToUpdate) {
      this.assetsMetadataLastUpdateTime = Date.now();
      this.assetsMetadataCache = this.api.getAssetsMetadata();
    }

    return this.assetsMetadataCache!;
  }

  /**
   * Returns splash pool list
   * @returns {Promise<CfmmPool[]>}
   */
  getSplashPools<P extends GetSplashPoolsParams = GetSplashPoolsParams>(
    params?: P,
  ): Promise<CfmmPool[]> {
    return Promise.all([
      this.api.getSplashPools(params),
      this.getAssetsMetadata(),
    ]).then(([pools, metadata]) => {
      return pools.map((rawCfmmPool) =>
        mapRawPoolToCfmmPool(
          {
            rawCfmmPool,
            xMetadata: metadata[rawCfmmPool.pool.x.asset],
            yMetadata: metadata[rawCfmmPool.pool.y.asset],
          },
          this.splash,
        ),
      );
    });
  }

  private getWalletContext(): Promise<CardanoCIP30WalletContext> {
    if (!this.splash.wallet) {
      this.handleEmptyWallet();
      return Promise.reject(new NoWalletError('please, provide wallet to sdk'));
    }
    if (!this.contextPromise) {
      this.contextPromise = Promise.race([
        this.splash.wallet
          .enable()
          .then((ctx) =>
            ctx.getNetworkId().then((walletNetworkId) => {
              const selectedNetworkId =
                this.splash.network === 'mainnet'
                  ? Number(NetworkId.mainnet().network())
                  : Number(NetworkId.testnet().network());

              if (selectedNetworkId !== walletNetworkId) {
                throw new InvalidWalletNetworkError(
                  `Expected ${this.splash.network}`,
                );
              }
              return ctx;
            }),
          )
          .catch((err) => {
            if (err instanceof InvalidWalletNetworkError) {
              throw err;
            }
            throw new WalletEnablingError(
              err instanceof Error ? err.message : err,
            );
          }),
        new Promise((resolve) => {
          setTimeout(() => resolve(undefined), 5_000);
        }).then(() => {
          throw new WalletEnablingError('can`t enable wallet');
        }),
      ]).catch((err) => {
        this.handleEmptyWallet();
        throw err;
      });
    }
    return this.contextPromise!;
  }

  private async handleCIP30WalletError<T>(promise: Promise<T>): Promise<T> {
    return promise.catch((err) => {
      this.handleEmptyWallet();
      throw new WalletApiError(err instanceof Error ? err.message : err);
    });
  }

  private handleEmptyWallet() {
    if (this.contextPromise) {
      this.contextPromise = undefined;
    }
  }

  private normalizeConfig(
    metadataConfig?: MetadataConfig | boolean,
  ): MetadataConfig | undefined {
    if (!metadataConfig) {
      return undefined;
    }
    return metadataConfig instanceof Object
      ? {
          updateTime: metadataConfig.updateTime || DEFAULT_UPDATE_TIME,
          defaultValue: metadataConfig.defaultValue,
        }
      : { updateTime: DEFAULT_UPDATE_TIME };
  }
}
