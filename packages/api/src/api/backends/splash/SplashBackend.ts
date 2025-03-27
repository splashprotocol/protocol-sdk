import {
  AssetId,
  AssetInfo,
  AssetInfoMetadata,
  Currencies,
  Currency,
  math,
  Network,
  Pair,
  Price,
  uint,
} from '@splashprotocol/core';
import { Backend, BackendMethodArgument } from '../../common/Backend.ts';
import {
  DEFAULT_MAINNET_MEMPOOL,
  DEFAULT_MAINNET_URL,
  DEFAULT_PREPROD_MEMPOOL,
  DEFAULT_PREPROD_URL,
  DEFAULT_PREVIEW_MEMPOOL,
  DEFAULT_PREVIEW_URL,
  IPFS_GATEWAY,
} from './constants.ts';

import { GetRecentTradesParams } from './methods/getRecentTrades/GetRecentTradesParams.ts';
import { GetRecentTradesResult } from './methods/getRecentTrades/GetRecentTradesResult.ts';
import { RawRecentTrade } from './methods/getRecentTrades/RawRecentTrade.ts';
import { mapRawRecentTradeToRecentTrade } from './methods/getRecentTrades/mapRawRecentTradeToRecentTrade.ts';
import { Bar } from '../../../types/Bar.ts';
import { GetChartLastBarParams } from './methods/getChartLastBar/getChartLastBarParams.ts';
import { GetChartHistoryParams } from './methods/getChartHistory/getChartHistoryParams.ts';
import { TrendPool } from '../../../types/TrendPool.ts';
import { RawTrendPool } from './methods/getTrendPools/RawTrendPool.ts';
import { mapRawTrendPoolToTrendPool } from './methods/getTrendPools/mapRawTrendPoolToTrendPool.ts';
import { ChartParams } from './methods/getPoolChart/ChartParams.ts';
import { RawPoolChartPoint } from './methods/getPoolChart/RawPoolChartPoint.ts';
import { GetPoolChartResult } from './methods/getPoolChart/GetPoolChartResult.ts';
import { GetSplashPoolsParams } from './methods/getSplashPools/getSplashPoolsParams.ts';
import { AnyPool } from '../../../types/AnyPool.ts';
import { AnyRawPool } from './methods/getSplashPools/RawSplashPool.ts';
import { mapRawPoolToPool } from './methods/getSplashPools/mapRawPoolToPool.ts';
import { ProtocolStats } from '../../../types/ProtocolStats.ts';
import { RawProtocolStats } from './methods/getProtocolStats/RawProtocolStats.ts';
import { mapRawProtocolStatsToProtocolStats } from './methods/getProtocolStats/mapRawProtocolStatsToProtocolStats.ts';
import { RawPair } from './methods/getPairs/RawPair.ts';
import { mapRawPairToPair } from './methods/getPairs/mapRawPairToPair.ts';
import { GetTradeOrdersParams } from './methods/getTradeOrders/GetTradeOrdersParams.ts';
import { GetTradeOrdersResult } from './methods/getTradeOrders/GetTradeOrdersResult.ts';
import { RawTradeOrder } from './methods/getTradeOrders/RawTradeOrder.ts';
import { mapRawTradeOrderToTradeOrder } from './methods/getTradeOrders/mapRawTradeOrderToTradeOrder.ts';
import { GetLiquidityOrdersParams } from './methods/getLiquidityOrders/GetLiquidityOrdersParams.ts';
import { GetLiquidityOrdersResult } from './methods/getLiquidityOrders/GetLiquidityOrdersResult.ts';
import {
  RawLiquidityDepositOrder,
  RawLiquidityRedeemOrder,
} from './methods/getLiquidityOrders/RawLiquidityOrder.ts';
import { mapRawLiquidityOrderToLiquidityOrder } from './methods/getLiquidityOrders/mapRawLiquidityOrderToLiquidityOrder.ts';
import { TradeOrder } from '../../../types/TradeOrder.ts';
import { AnyLiquidityOrder } from '../../../types/AnyLiquidityOrder.ts';
import { GetOrderBookParams } from './methods/getOrderBook/GetOrderBookParams.ts';
import { OrderBook } from '../../../types/OrderBook.ts';
import { RawOrderBook } from './methods/getOrderBook/RawOrderBook.ts';
import { mapRawOrderBookToOrderBook } from './methods/getOrderBook/mapRawOrderBookToOrderBook.ts';
import { SplashOperationsConfig } from './methods/getSplashOperationsConfig/SplashOperationsConfig.ts';

export interface SplashBackendMetadataConfig {
  readonly ipfsGateway?: string;
}

export type SplashBackendUrlsConfig = {
  [key in Network]?: string;
};

export interface SplashBackendConfig {
  readonly network: Network;
  readonly urls?: SplashBackendUrlsConfig;
  readonly mempoolUrls?: SplashBackendUrlsConfig;
  readonly metadata?: boolean | SplashBackendMetadataConfig;
}

export class SplashBackend implements Backend<SplashBackend> {
  static new(config: SplashBackendConfig) {
    return new SplashBackend(config);
  }

  readonly network: Network;

  private readonly metadata?: SplashBackendMetadataConfig;

  private readonly urls: Required<SplashBackendUrlsConfig> = {
    mainnet: DEFAULT_MAINNET_URL,
    preprod: DEFAULT_PREPROD_URL,
    preview: DEFAULT_PREVIEW_URL,
  };

  private readonly mempoolUrls: Required<SplashBackendUrlsConfig> = {
    mainnet: DEFAULT_MAINNET_MEMPOOL,
    preprod: DEFAULT_PREPROD_MEMPOOL,
    preview: DEFAULT_PREVIEW_MEMPOOL,
  };

  private get url() {
    return this.urls[this.network];
  }

  private get mempoolUrl() {
    return this.mempoolUrls[this.network];
  }

  /**
   * Returns recent trades list
   * @param {BackendMethodArgument<GetRecentTradesParams>} params
   * @returns {Promise<GetRecentTradesResult>}
   */
  getRecentTrades({
    params: { base, quote, offset, limit },
  }: BackendMethodArgument<GetRecentTradesParams>): Promise<GetRecentTradesResult> {
    return fetch(
      `${this.url}trading-view/recent-trades/feed?base=${base.assetId}&quote=${quote.assetId}&offset=${offset}&limit=${limit}`,
    )
      .then((res) => res.json())
      .then((data: { count: uint; body: RawRecentTrade[] }) => {
        return this.getAssetsMetadata([base.assetId, quote.assetId]).then(
          ([baseMetadata, quoteMetadata]) => ({
            count: data.count,
            base: base.withMetadata(baseMetadata),
            quote: quote.withMetadata(quoteMetadata),
            data: data.body.map((rawRecentTrade) =>
              mapRawRecentTradeToRecentTrade({
                base: base,
                quote: quote,
                rawRecentTrade,
                baseMetadata: baseMetadata,
                quoteMetadata: quoteMetadata,
              }),
            ),
          }),
        );
      });
  }

  /**
   * Returns chart last bar using params
   * @param {BackendMethodArgument<GetChartLastBarParams>} params
   * @returns {Promise<Bar>}
   */
  getChartLastBar({
    params: { base, quote, resolution },
  }: BackendMethodArgument<GetChartLastBarParams>): Promise<Bar> {
    return fetch(
      `${this.url}charts/last?base=${base.assetId}&quote=${quote.assetId}&resolution=${resolution}`,
    ).then((res) => res.json());
  }

  /**
   * Returns chart history bars
   * @param {BackendMethodArgument<GetChartHistoryParams>} params
   * @returns {Promise<Bar[]>}
   */
  getChartHistory({
    params: { base, quote, resolution, to, from },
  }: BackendMethodArgument<GetChartHistoryParams>): Promise<Bar[]> {
    return fetch(
      `${this.url}charts/history?base=${base.assetId}&quote=${quote.assetId}&from=${from}&to=${to}&resolution=${resolution}`,
    ).then((res) => res.json());
  }

  /**
   * Return trend pools
   * @returns {Promise<TrendPool[]>}
   */
  getTrendPools(): Promise<TrendPool[]> {
    return fetch(`${this.url}pools/trended`)
      .then((res) => res.json())
      .then((rawTrendPools: RawTrendPool[]) =>
        Promise.all(
          rawTrendPools.map((rawTrendPool) =>
            this.getAssetsMetadata([rawTrendPool.x, rawTrendPool.y]).then(
              ([xMetadata, yMetadata]) =>
                mapRawTrendPoolToTrendPool({
                  xMetadata,
                  yMetadata,
                  rawTrendPool,
                }),
            ),
          ),
        ),
      );
  }

  /**
   * Returns pool tvl chart by params
   * @param {BackendMethodArgument<ChartParams>} params
   * @returns {Promise<GetPoolChartResult>}
   */
  getPoolTvlChart({
    params: { poolId, poolType, interval },
  }: BackendMethodArgument<ChartParams>): Promise<GetPoolChartResult> {
    return fetch(
      `${this.url}pool/tvl/chart?poolId=${poolId}&interval=${interval}&poolType=${poolType}`,
    )
      .then((res) => res.json())
      .then((data: RawPoolChartPoint[]) => ({
        asset: AssetInfo.ada,
        data: data.map((rawChartPoint) => ({
          value: Currency.ada(BigInt(rawChartPoint.value)),
          timestamp: rawChartPoint.timestamp * 1_000,
        })),
      }));
  }

  /**
   * Returns pool volume chart by params
   * @param {BackendMethodArgument<ChartParams>} params
   * @returns {Promise<PoolChartPoint[]>}
   */
  getPoolVolumeChart({
    params: { poolId, poolType, interval },
  }: BackendMethodArgument<ChartParams>): Promise<GetPoolChartResult> {
    return fetch(
      `${this.url}pool/volume/chart?poolId=${poolId}&interval=${interval}&poolType=${poolType}`,
    )
      .then((res) => res.json())
      .then((data: RawPoolChartPoint[]) => ({
        asset: AssetInfo.ada,
        data: data.map((rawChartPoint) => ({
          value: Currency.ada(BigInt(rawChartPoint.value)),
          timestamp: rawChartPoint.timestamp * 1_000,
        })),
      }));
  }

  /**
   * Returns pool fee chart by params
   * @param {ChartParams} params
   * @returns {BackendMethodArgument<ChartParams><PoolChartPoint[]>}
   */
  getPoolFeesChart({
    params: { poolId, poolType, interval },
  }: BackendMethodArgument<ChartParams>): Promise<GetPoolChartResult> {
    return fetch(
      `${this.url}pool/fee/chart?poolId=${poolId}&interval=${interval}&poolType=${poolType}`,
    )
      .then((res) => res.json())
      .then((data: RawPoolChartPoint[]) => ({
        asset: AssetInfo.ada,
        data: data.map((rawChartPoint) => ({
          value: Currency.ada(BigInt(rawChartPoint.value)),
          timestamp: rawChartPoint.timestamp * 1_000,
        })),
      }));
  }

  /**
   * Returns splash operation config
   * @returns {Promise<SplashOperationsConfig>}
   */
  getSplashOperationConfig(): Promise<SplashOperationsConfig> {
    return fetch('https://spectrum.fi/settings.json').then((res) => res.json());
  }

  /**
   * Returns pool collection using params
   * @param {BackendMethodArgument<GetSplashPoolsParams>} params
   * @returns {Promise<AnyPool[]>}
   */
  getSplashPools({
    params,
  }: BackendMethodArgument<GetSplashPoolsParams>): Promise<AnyPool[]> {
    const duplicated = params?.duplicated || true;
    const verified = params?.verified === undefined ? true : params?.verified;

    return fetch(
      `${this.url}pools/overview?verified=${verified}&duplicated=${duplicated}`,
    )
      .then((res) => res.json())
      .then((rawPools: AnyRawPool[]) =>
        Promise.all(
          rawPools.map((rawPool) =>
            this.getAssetsMetadata([
              rawPool.pool.x.asset,
              rawPool.pool.y.asset,
            ]).then(([xMetadata, yMetadata]) =>
              mapRawPoolToPool({
                xMetadata,
                yMetadata,
                rawPool,
              }),
            ),
          ),
        ),
      );
  }

  /**
   * Returns protocol stats
   * @returns {Promise<ProtocolStats>}
   */
  getProtocolStats(): Promise<ProtocolStats> {
    return fetch(`${this.url}platform/stats`)
      .then((res) => res.json())
      .then((rawPS: RawProtocolStats) =>
        mapRawProtocolStatsToProtocolStats(rawPS),
      );
  }

  /**
   * returns pairs
   * @returns {Promise<Pair[]>}
   */
  getPairs(): Promise<Pair[]> {
    return fetch(`${this.url}trading-view/pair-list`)
      .then((res) => res.json())
      .then((rawPairs: RawPair[]) =>
        Promise.all(
          rawPairs.map((rawPair) =>
            this.getAssetsMetadata([rawPair.base, rawPair.quote]).then(
              ([baseMetadata, quoteMetadata]) =>
                mapRawPairToPair({
                  rawPair,
                  baseMetadata,
                  quoteMetadata,
                }),
            ),
          ),
        ),
      );
  }

  /**
   * Returns ada usd rate
   * @returns {Promise<Price>}
   */
  getAdaUsdRate(): Promise<Price> {
    return fetch(`${this.url}ada-usd/rate`)
      .then((res) => res.json())
      .then((rawPrice: string) => math.evaluate(`${rawPrice} / 10^4`).toFixed())
      .then((value) =>
        Price.new({
          base: AssetInfo.ada,
          quote: AssetInfo.usd,
          value,
        }),
      )
      .catch(() =>
        Price.new({
          base: AssetInfo.ada,
          quote: AssetInfo.usd,
          value: '0',
        }),
      );
  }

  /**
   * Returns trade orders using paging
   * @param {BackendMethodArgument<GetTradeOrdersParams>} params
   * @returns {Promise<GetTradeOrdersResult>}
   */
  getTradeOrders({
    params: { limit, offset },
    api,
  }: BackendMethodArgument<GetTradeOrdersParams>): Promise<GetTradeOrdersResult> {
    return api
      .getPaymentKeysHashes()
      .then((paymentKeyHashes) =>
        fetch(
          `${this.url}history/order/trades?limit=${limit}&offset=${offset}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(paymentKeyHashes),
          },
        ),
      )
      .then((res) => res.json())
      .then((data: { count: uint; orders: RawTradeOrder[] }) =>
        Promise.all(
          data.orders.map((rawTradeOrder) =>
            this.getAssetsMetadata([
              rawTradeOrder.input,
              rawTradeOrder.output,
            ]).then(([inputMetadata, outputMetadata]) =>
              mapRawTradeOrderToTradeOrder({
                inputMetadata,
                outputMetadata,
                rawTradeOrder,
              }),
            ),
          ),
        ).then((orders) => ({ orders, count: data.count })),
      );
  }

  /**
   * Returns trade open orders
   * @returns {Promise<GetTradeOrdersResult>}
   */
  getTradeOpenOrders({
    api,
  }: BackendMethodArgument<null>): Promise<GetTradeOrdersResult> {
    return api
      .getPaymentKeysHashes()
      .then((paymentKeyHashes) =>
        fetch(`${this.url}history/order/open`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify(paymentKeyHashes),
        }),
      )
      .then((res) => res.json())
      .then((openOrders: RawTradeOrder[]) =>
        Promise.all(
          openOrders.map((rawTradeOrder) =>
            this.getAssetsMetadata([
              rawTradeOrder.input,
              rawTradeOrder.output,
            ]).then(([inputMetadata, outputMetadata]) =>
              mapRawTradeOrderToTradeOrder({
                inputMetadata,
                outputMetadata,
                rawTradeOrder,
              }),
            ),
          ),
        ),
      )
      .then((orders) => ({ orders, count: orders.length }));
  }

  /**
   * Returns liquidity orders using paging
   * @param {BackendMethodArgument<GetLiquidityOrdersParams>} params
   * @returns {Promise<GetTradeOrdersResult>}
   */
  getLiquidityOrders({
    params: { limit, offset },
    api,
  }: BackendMethodArgument<GetLiquidityOrdersParams>): Promise<GetLiquidityOrdersResult> {
    return api
      .getPaymentKeysHashes()
      .then((paymentKeyHashes) =>
        fetch(
          `${this.url}history/order?limit=${limit}&offset=${offset}&entityTypeFilter=AnyLiquidityOps`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(paymentKeyHashes),
          },
        ),
      )
      .then((res) => res.json())
      .then(
        (data: {
          count: uint;
          orders: (RawLiquidityDepositOrder | RawLiquidityRedeemOrder)[];
        }) =>
          Promise.all(
            data.orders.map((rawLiquidityOrder) => {
              if (
                rawLiquidityOrder.orderType === 'cfmmDeposit' ||
                rawLiquidityOrder.orderType === 'weightedDeposit' ||
                rawLiquidityOrder.orderType === 'stableDeposit'
              ) {
                return this.getAssetsMetadata([
                  rawLiquidityOrder.x.asset,
                  rawLiquidityOrder.y.asset,
                ]).then(([metadataX, metadataY]) =>
                  mapRawLiquidityOrderToLiquidityOrder({
                    rawLiquidityOrder,
                    metadataX,
                    metadataY,
                  }),
                );
              }

              const rawLiquidityRedeemOrder =
                rawLiquidityOrder as RawLiquidityRedeemOrder;

              return this.getAssetsMetadata([
                rawLiquidityRedeemOrder.xAsset,
                rawLiquidityRedeemOrder.yAsset,
              ]).then(([metadataX, metadataY]) =>
                mapRawLiquidityOrderToLiquidityOrder({
                  rawLiquidityOrder,
                  metadataX,
                  metadataY,
                }),
              );
            }),
          ).then((orders) => ({ orders, count: data.count })),
      );
  }

  /**
   * Returns mempool of orders
   * @returns
   */
  getOrdersMempool({
    api,
  }: BackendMethodArgument<null>): Promise<(TradeOrder | AnyLiquidityOrder)[]> {
    return api
      .getPaymentKeysHashes()
      .then((paymentKeyHashes) =>
        fetch(this.mempoolUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify(paymentKeyHashes),
        }),
      )
      .then((res) => res.json())
      .then(
        (
          rawOrders: (
            | RawTradeOrder
            | RawLiquidityDepositOrder
            | RawLiquidityRedeemOrder
          )[],
        ) => {
          return Promise.all(
            rawOrders.map((rawOrder) => {
              if (
                rawOrder.orderType === 'cfmmDeposit' ||
                rawOrder.orderType === 'weightedDeposit' ||
                rawOrder.orderType === 'stableDeposit'
              ) {
                return this.getAssetsMetadata([
                  rawOrder.x.asset,
                  rawOrder.y.asset,
                ]).then(([metadataX, metadataY]) =>
                  mapRawLiquidityOrderToLiquidityOrder({
                    rawLiquidityOrder: rawOrder,
                    metadataX,
                    metadataY,
                  }),
                );
              }
              if (
                rawOrder.orderType === 'cfmmRedeem' ||
                rawOrder.orderType === 'weightedRedeem' ||
                rawOrder.orderType === 'stableRedeem'
              ) {
                return this.getAssetsMetadata([
                  rawOrder.xAsset,
                  rawOrder.yAsset,
                ]).then(([metadataX, metadataY]) =>
                  mapRawLiquidityOrderToLiquidityOrder({
                    rawLiquidityOrder: rawOrder,
                    metadataX,
                    metadataY,
                  }),
                );
              }

              const rawTradeOrder = rawOrder as RawTradeOrder;

              return this.getAssetsMetadata([
                rawTradeOrder.input,
                rawTradeOrder.output,
              ]).then(([inputMetadata, outputMetadata]) =>
                mapRawTradeOrderToTradeOrder({
                  rawTradeOrder: rawTradeOrder,
                  inputMetadata,
                  outputMetadata,
                }),
              );
            }),
          );
        },
      );
  }

  /**
   * Returns mempool trade orders by pkhs
   * @param {BackendMethodArgument<null>} arg
   * @returns {Promise<TradeOrder[]>}
   */
  getTradeOrdersMempool(
    arg: BackendMethodArgument<null>,
  ): Promise<TradeOrder[]> {
    return this.getOrdersMempool(arg).then((orders) =>
      orders.filter((order) => order.operation === 'trade'),
    );
  }

  /**
   * Returns mempool liquidity orders by pkhs
   * @param {BackendMethodArgument<null>} arg
   * @returns {Promise<AnyLiquidityOrder[]>}
   */
  getLiquidityOrdersMempool(
    arg: BackendMethodArgument<null>,
  ): Promise<AnyLiquidityOrder[]> {
    return this.getOrdersMempool(arg).then((orders) =>
      orders.filter((order) => order.operation !== 'trade'),
    );
  }

  /**
   * Returns order book by specified base-quote
   * @param {BackendMethodArgument<GetOrderBookParams>} params
   * @returns {Promise<OrderBook>}
   */
  getOrderBook({
    params: { base, quote },
  }: BackendMethodArgument<GetOrderBookParams>): Promise<OrderBook> {
    return fetch(
      `${this.url}trading-view/order-book?base=${base.assetId}&quote=${quote.assetId}`,
    )
      .then((res) => res.json())
      .then((rawOrderBook: RawOrderBook) => {
        return this.getAssetsMetadata([base.assetId, quote.assetId]).then(
          ([baseMetadata, quoteMetadata]) =>
            mapRawOrderBookToOrderBook({
              rawOrderBook,
              baseMetadata,
              quoteMetadata,
            }),
        );
      });
  }

  getBalance({ api }: BackendMethodArgument<null>): Promise<Currencies> {
    return api
      .getBalanceCbor()
      .then((balanceCbor) =>
        Currencies.fromCbor(balanceCbor, (currency) =>
          currency.isAda() ? AssetInfo.ada.metadata : undefined,
        ),
      );
  }

  getAssetMetadata(assetId: AssetId): Promise<AssetInfoMetadata | undefined> {
    console.log(assetId);
    if (!this.metadata) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(undefined);
  }

  private getAssetsMetadata(
    assetIds: AssetId[],
  ): Promise<(AssetInfoMetadata | undefined)[]> {
    if (!assetIds.length) {
      return Promise.resolve([]);
    }
    return Promise.all(
      assetIds.map((assetId) => this.getAssetMetadata(assetId)),
    );
  }

  private constructor(config: SplashBackendConfig) {
    this.network = config.network;
    this.metadata = this.normalizeMetadataConfig(config.metadata);
    this.mempoolUrls = this.normalizeUrlsConfig(
      config.mempoolUrls,
      this.mempoolUrls,
    );
    this.urls = this.normalizeUrlsConfig(config.urls, this.urls);
  }

  private normalizeMetadataConfig(
    metadata?: boolean | SplashBackendMetadataConfig,
  ): SplashBackendMetadataConfig | undefined {
    if (!metadata) {
      return undefined;
    }
    if (typeof metadata === 'boolean') {
      return { ipfsGateway: IPFS_GATEWAY };
    }
    return { ipfsGateway: IPFS_GATEWAY, ...metadata };
  }

  private normalizeUrlsConfig(
    urls: SplashBackendUrlsConfig | undefined,
    defaultValue: Required<SplashBackendUrlsConfig>,
  ): Required<SplashBackendUrlsConfig> {
    if (!urls) {
      return defaultValue;
    }
    return {
      ...defaultValue,
      ...urls,
    };
  }
}
