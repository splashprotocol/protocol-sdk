import {
  Address,
  BaseAddress,
  NetworkId,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Api } from '../../core/api/Api.ts';
import { AssetMetadata } from '../../core/api/types/common/AssetMetadata.ts';
import { PoolChartPoint } from '../../core/api/types/common/PoolChartPoint.ts';
import { RawTradeOrder } from '../../core/api/types/common/RawTradeOrder.ts';
import {
  GetChartHistoryParams,
  GetChartHistoryResult,
} from '../../core/api/types/getChartHistory/getChartHistory.ts';
import {
  GetChartLastBarParams,
  GetChartLastBarResult,
} from '../../core/api/types/getChartLastBar/getChartLastBar.ts';
import { GetLiquidityOrdersParams } from '../../core/api/types/getLiquidityOrders/getLiquidityOrders.ts';
import { GetOrderBookParams } from '../../core/api/types/getOrderBook/getOrderBook.ts';
import { GetPoolFeesChartParams } from '../../core/api/types/getPoolFeesChart/getPoolFeesChart.ts';
import { GetPoolTvlChartParams } from '../../core/api/types/getPoolTvlChart/getPoolTvlChart.ts';
import { GetPoolVolumeChartParams } from '../../core/api/types/getPoolVolumeChart/getPoolVolumeChart.ts';
import { GetRecentTradesParams } from '../../core/api/types/getRecentTrades/getRecentTrades.ts';
import { GetSplashPoolsParams } from '../../core/api/types/getSplashPools/getSplashPools.ts';
import { GetTradeOrdersParams } from '../../core/api/types/getTradeOrders/getTradeOrders.ts';
import { GetUTxOByRefParams } from '../../core/api/types/getUTxOByRef/getUTxOByRef.ts';
import { AssetInfo } from '../../core/models/assetInfo/AssetInfo.ts';
import { Currencies } from '../../core/models/currencies/Currencies.ts';
import { Currency } from '../../core/models/currency/Currency.ts';
import { DepositLiquidityOrder } from '../../core/models/liquidityOrder/DepositLiquidityOrder.ts';
import { RedeemLiquidityOrder } from '../../core/models/liquidityOrder/RedeemLiquidityOrder.ts';
import { OutputParams } from '../../core/models/output/Output.ts';
import { Pair } from '../../core/models/pair/Pair.ts';
import { CfmmPool } from '../../core/models/pool/cfmm/CfmmPool.ts';
import { StablePool } from '../../core/models/pool/stable/StablePool.ts';
import { WeightedPool } from '../../core/models/pool/weighted/WeightedPool.ts';
import { Price } from '../../core/models/price/Price.ts';
import { RecentTrade } from '../../core/models/recentTrade/RecentTrade.ts';
import { SignedTransaction } from '../../core/models/signedTransaction/SignedTransaction.ts';
import { TradeOrder } from '../../core/models/tradeOrder/TradeOrder.ts';
import { Transaction } from '../../core/models/transaction/Transaction.ts';
import { UTxO } from '../../core/models/utxo/UTxO.ts';
import { CardanoCIP30WalletContext } from '../../core/types/CardanoCIP30WalletBridge.ts';
import { NetworkContext } from '../../core/types/NetworkContext.ts';
import { ProtocolParams } from '../../core/types/ProtocolParams.ts';
import { Dictionary, TransactionHash, uint } from '../../core/types/types.ts';
import { predictDepositAda } from '../../core/utils/predictDepositAdaForExecutor/predictDepositAda.ts';
import { Splash } from '../splash.ts';
import { InvalidWalletNetworkError } from './common/errors/InvalidWalletNetworkError.ts';
import { NoWalletError } from './common/errors/NoWalletError.ts';
import { UserDeclinedSignError } from './common/errors/UserDeclinedSignError.ts';
import { WalletAccountError } from './common/errors/WalletAccountError.ts';
import { WalletApiError } from './common/errors/WalletApiError.ts';
import { WalletEnablingError } from './common/errors/WalletEnablingError.ts';
import { mapRawLiquidityOrderToLiquidityOrder } from './common/mappers/mapRawLiquidityOrderToLiquidityOrder.ts';
import { mapRawOrderBookToOrderBook } from './common/mappers/mapRawOrderBookToOrderBook.ts';
import { mapRawPairToPair } from './common/mappers/mapRawPairToPair.ts';
import { mapRawPoolToPool } from './common/mappers/mapRawPoolToPool.ts';
import { mapRawProtocolStatsToProtocolStats } from './common/mappers/mapRawProtocolStatsToProtocolStats.ts';
import { mapRawRecentTradeToRecentTrade } from './common/mappers/mapRawRecentTradeToRecentTrade.ts';
import { mapRawTradeOrderToTradeOrder } from './common/mappers/mapRawTradeOrderToTradeOrder.ts';
import { mapRawTrendPoolToTrendPool } from './common/mappers/mapRawTrendPoolToTrendPool.ts';
import { mapRawUTxOToUTxO } from './common/mappers/mapRawUTxOToUTxO.ts';
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

  private protocolParamsCacheP: Promise<ProtocolParams> | undefined;

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

  async getUTxOByRef(params: GetUTxOByRefParams): Promise<UTxO | undefined> {
    return Promise.all([
      this.getProtocolParams(),
      this.getAssetsMetadata(),
      this.api.getUTxOByRef(params),
    ]).then(([pParams, metadata, rawUTxO]) =>
      mapRawUTxOToUTxO({
        pParams,
        metadata,
        rawUTxO,
      }),
    );
  }

  /**
   * Returns current ada usd rate
   * @return {Promise<Price>}
   */
  async getAdaUsdRate(): Promise<Price> {
    return this.api
      .getAdaUsdRate()
      .then((res) =>
        Price.new({
          base: AssetInfo.ada,
          quote: AssetInfo.usd,
          raw: res,
        }),
      )
      .catch(() =>
        Price.new({
          base: AssetInfo.ada,
          quote: AssetInfo.usd,
          raw: 0,
        }),
      );
  }

  /**
   * Returns recent trades by pair
   * @param params {GetRecentTradesParams}
   * @return {Promise<{ count: uint; data: RecentTrade[] }>}
   */
  async getRecentTrades(params: GetRecentTradesParams): Promise<{
    count: uint;
    data: RecentTrade[];
    base: AssetInfo;
    quote: AssetInfo;
  }> {
    return Promise.all([
      this.api.getRecentTrades(params),
      this.getAssetsMetadata(),
    ]).then(([rawRecentTrades, metadata]) => {
      const baseMetadata = metadata[params.base.splashId];
      const quoteMetadata = metadata[params.quote.splashId];

      return {
        count: rawRecentTrades.count,
        base: params.base.withMetadata(baseMetadata),
        quote: params.quote.withMetadata(quoteMetadata),
        data: rawRecentTrades.data.map((rawRecentTrade) =>
          mapRawRecentTradeToRecentTrade({
            base: params.base,
            quote: params.quote,
            rawRecentTrade,
            baseMetadata: baseMetadata,
            quoteMetadata: quoteMetadata,
          }),
        ),
      };
    });
  }

  /**
   * Returns chart pair history using params
   * @param params {GetChartHistoryParams}
   */
  async getChartHistory(
    params: GetChartHistoryParams,
  ): Promise<GetChartHistoryResult> {
    return this.api.getChartHistory(params);
  }

  /**
   * Returns chart pair last bar using params
   * @param params {GetChartLastBarParams}
   */
  async getChartLastBar(
    params: GetChartLastBarParams,
  ): Promise<GetChartLastBarResult> {
    return this.api.getChartLastBar(params);
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
   * Returns signed transaction
   * @param {Transaction} transaction
   * @return {Promise<SignedTransaction>}
   */
  async sign(transaction: Transaction): Promise<SignedTransaction> {
    return Promise.all([
      this.getWalletContext().then((ctx) =>
        this.handleCIP30WalletError(
          ctx.signTx(transaction.cbor, transaction.partialSign),
        ),
      ),
      this.splash['remoteCollaterals'] && transaction.remoteCollateral
        ? this.splash['remoteCollaterals'].sign(transaction)
        : Promise.resolve(undefined),
    ]).then(([witnessSetWithSign, remoteCollaterals]) => {
      return SignedTransaction.new({
        transaction,
        witnessSetsWithSign: remoteCollaterals
          ? [witnessSetWithSign, remoteCollaterals]
          : [witnessSetWithSign],
      });
    });
  }

  /**
   * Returns submitted transaction id
   * @param {SignedTransaction} signedTransaction
   * @return {Promise<TransactionHash>}
   */
  async submit(signedTransaction: SignedTransaction): Promise<TransactionHash> {
    return this.getWalletContext().then((ctx) =>
      this.handleCIP30WalletError(
        ctx.submitTx(signedTransaction.wasm.to_cbor_hex()),
      ),
    );
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
   * Returns all wallet addresses
   * @return {Promise<string>}
   */
  async getAddresses(): Promise<string[]> {
    return this.getWalletContext()
      .then((ctx) =>
        Promise.all([
          this.handleCIP30WalletError(ctx.getUnusedAddresses()),
          this.handleCIP30WalletError(ctx.getUsedAddresses()),
          this.handleCIP30WalletError(ctx.getChangeAddress()),
        ]),
      )
      .then(([unusedAddresses, usedAddresses, changeAddress]) =>
        unusedAddresses.concat(usedAddresses).concat([changeAddress]),
      )
      .then((addresses) =>
        addresses.map((cborAddressHex) =>
          Address.from_hex(cborAddressHex).to_bech32(),
        ),
      );
  }

  /**
   * Returns all wallet pkhs
   * @return {Promise<string>}
   */
  async getPaymentKeysHashes(): Promise<string[]> {
    return this.getWalletContext()
      .then((ctx) =>
        Promise.all([
          this.handleCIP30WalletError(ctx.getUnusedAddresses()),
          this.handleCIP30WalletError(ctx.getUsedAddresses()),
          this.handleCIP30WalletError(ctx.getChangeAddress()),
        ]),
      )
      .then(([unusedAddresses, usedAddresses, changeAddress]) =>
        unusedAddresses.concat(usedAddresses).concat([changeAddress]),
      )
      .then((addresses) =>
        addresses.map(
          (cborAddressHex) =>
            BaseAddress.from_address(Address.from_hex(cborAddressHex))
              ?.payment()
              .as_pub_key()
              ?.to_hex(),
        ),
      )
      .then((pkhsOrUndefineds) =>
        pkhsOrUndefineds.filter(
          (pkhOrUndefined): pkhOrUndefined is string => !!pkhOrUndefined,
        ),
      )
      .then((pkhs) => Array.from(new Set(pkhs).values()));
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
   * Returns necessary ada for backward tx
   * @param {OutputParams} params
   * @return {Promise<Currency>}
   */
  async predictDepositAda(params: OutputParams): Promise<Currency> {
    return predictDepositAda(await this.getProtocolParams(), params);
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
   * Returns current wallet uTxOs
   * @return {Promise<UTxO[]>}
   */
  async getUTxOs(): Promise<UTxO[]> {
    return Promise.all([
      this.getAssetsMetadata(),
      this.getWalletContext().then((ctx) =>
        this.handleCIP30WalletError(ctx.getUtxos()),
      ),
    ]).then(([metadata, uTxOsCbors]) => {
      return (uTxOsCbors || []).map((uTxOsCbor) =>
        UTxO.new(uTxOsCbor, metadata),
      );
    });
  }

  /**
   * Returns collaterals
   * @return {Promise<UTxO[]>}
   */
  async getCollaterals(): Promise<UTxO[]> {
    return Promise.all([
      this.getAssetsMetadata(),
      this.getWalletContext().then((ctx) =>
        ctx.getCollateral
          ? this.handleCIP30WalletError(ctx.getCollateral())
          : this.handleCIP30WalletError(ctx.experimental.getCollateral()),
      ),
    ]).then(([metadata, uTxOsCbors]) => {
      return (uTxOsCbors || []).map((uTxOsCbor) =>
        UTxO.new(uTxOsCbor, metadata),
      );
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
  ): Promise<(CfmmPool | WeightedPool | StablePool)[]> {
    return Promise.all([
      this.api.getSplashPools(params),
      this.getAssetsMetadata(),
    ]).then(([pools, metadata]) => {
      return pools.map((rawPool) =>
        mapRawPoolToPool(
          {
            rawPool: rawPool,
            xMetadata: metadata[rawPool.pool.x.asset],
            yMetadata: metadata[rawPool.pool.y.asset],
          },
          this.splash,
        ),
      );
    });
  }

  /**
   * Returns open orders list
   * @return {Promise<{count: number, orders: TradeOrder[]}>}
   */
  async getTradeOpenOrders(): Promise<{
    count: number;
    operations: TradeOrder[];
  }> {
    return Promise.all([
      this.getPaymentKeysHashes().then((paymentKeyHashes) =>
        this.api.getTradeOpenOrders({
          paymentKeyHashes,
        }),
      ),
      this.getAssetsMetadata(),
    ]).then(([trades, metadata]) => {
      return {
        count: trades.count,
        operations: trades.orders.map((trade) =>
          mapRawTradeOrderToTradeOrder(
            {
              rawTradeOrder: trade,
              inputMetadata: metadata[trade.input],
              outputMetadata: metadata[trade.output],
            },
            this.splash,
          ),
        ),
      };
    });
  }

  /**
   * Returns orders list using limit and asset
   * @param {P} params
   * @return {Promise<{count: number, orders: TradeOrder[]}>}
   */
  async getTradeOrders(
    params: Omit<GetTradeOrdersParams, 'paymentKeyHashes'>,
  ): Promise<{ count: number; operations: TradeOrder[] }> {
    return Promise.all([
      this.getPaymentKeysHashes().then((paymentKeyHashes) =>
        this.api.getTradeOrders({
          limit: params.limit,
          offset: params.offset,
          paymentKeyHashes,
        }),
      ),
      this.getAssetsMetadata(),
    ]).then(([trades, metadata]) => {
      return {
        count: trades.count,
        operations: trades.orders.map((trade) =>
          mapRawTradeOrderToTradeOrder(
            {
              rawTradeOrder: trade,
              inputMetadata: metadata[trade.input],
              outputMetadata: metadata[trade.output],
            },
            this.splash,
          ),
        ),
      };
    });
  }

  /**
   * Returns orders mempool
   * @return {Promise<(TradeOrder | DepositLiquidityOrder | RedeemLiquidityOrder)[]>}
   */
  async getOrdersMempool(): Promise<
    (TradeOrder | DepositLiquidityOrder | RedeemLiquidityOrder)[]
  > {
    return Promise.all([
      this.getPaymentKeysHashes().then((paymentKeyHashes) =>
        this.api.getOrdersMempool({
          paymentKeyHashes,
        }),
      ),
      this.getAssetsMetadata(),
    ]).then(([orders, metadata]) => {
      return orders.map((rawOrder) => {
        if (
          rawOrder.orderType === 'cfmmDeposit' ||
          rawOrder.orderType === 'cfmmRedeem' ||
          rawOrder.orderType === 'weightedDeposit' ||
          rawOrder.orderType === 'weightedRedeem'
        ) {
          return mapRawLiquidityOrderToLiquidityOrder(
            {
              rawLiquidityOrder: rawOrder,
              metadata,
            },
            this.splash,
          );
        }
        const rawTradeOrder = rawOrder as RawTradeOrder;
        return mapRawTradeOrderToTradeOrder(
          {
            rawTradeOrder: rawTradeOrder,
            inputMetadata: metadata[rawTradeOrder.input],
            outputMetadata: metadata[rawTradeOrder.output],
          },
          this.splash,
        );
      });
    });
  }

  /**
   * Returns orders list using limit and asset
   * @param {Omit<GetLiquidityOrdersParams, "paymentKeyHashes">} params
   * @return {Promise<{count: number, operations: (RedeemLiquidityOrder | DepositLiquidityOrder)[]}>}
   */
  async getLiquidityOrders(
    params: Omit<GetLiquidityOrdersParams, 'paymentKeyHashes'>,
  ): Promise<{
    count: number;
    operations: (RedeemLiquidityOrder | DepositLiquidityOrder)[];
  }> {
    return Promise.all([
      this.getPaymentKeysHashes().then((paymentKeyHashes) =>
        this.api.getLiquidityOrders({
          limit: params.limit,
          offset: params.offset,
          paymentKeyHashes,
        }),
      ),
      this.getAssetsMetadata(),
    ]).then(([orders, metadata]) => {
      return {
        count: orders.count,
        operations: orders.order.map((rawLiquidityOrder) =>
          mapRawLiquidityOrderToLiquidityOrder(
            {
              rawLiquidityOrder,
              metadata,
            },
            this.splash,
          ),
        ),
      };
    });
  }

  /**
   * Returns current protocol params
   * @return {Promise<ProtocolParams>}
   */
  async getProtocolParams(): Promise<ProtocolParams> {
    if (!this.protocolParamsCacheP) {
      this.protocolParamsCacheP = this.api.getProtocolParams();
    }
    return this.protocolParamsCacheP;
  }

  /**
   * Returns network best block info
   * @return {Promise<NetworkContext>}
   */
  async getNetworkContext(): Promise<NetworkContext> {
    return this.api.getNetworkContext();
  }

  /**
   * Sync current wallet supports this one
   * @return {Promise<void>}
   */
  async walletManualSync(): Promise<boolean> {
    return this.getWalletContext().then((ctx) =>
      ctx.experimental.syncAccount ? ctx.experimental.syncAccount() : false,
    );
  }

  private getWalletContext(): Promise<CardanoCIP30WalletContext> {
    if (!this.splash.wallet) {
      this.handleEmptyWallet();
      return Promise.reject(new NoWalletError('please, provide wallet to sdk'));
    }
    if (!this.contextPromise) {
      let timerId: any = undefined;
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
          timerId = setTimeout(() => resolve(undefined), 60_000);
        }).then(() => {
          throw new WalletEnablingError('can`t enable wallet');
        }),
      ])
        .then((ctx) => {
          clearTimeout(timerId);
          return ctx;
        })
        .catch((err) => {
          this.handleEmptyWallet();
          throw err;
        });
    }
    return this.contextPromise!;
  }

  private async handleCIP30WalletError<T>(promise: Promise<T>): Promise<T> {
    return promise.catch((err) => {
      this.handleEmptyWallet();
      if (
        err instanceof WalletEnablingError ||
        err instanceof InvalidWalletNetworkError ||
        err instanceof NoWalletError
      ) {
        throw err;
      }
      console.log(err);
      // TODO: FIX FOR ALL WALLETS
      if (
        err?.message?.includes('account changed') ||
        err?.message?.includes('no account changed')
      ) {
        throw new WalletAccountError(err.message);
      }
      if (err?.message?.includes('user declined sign tx')) {
        throw new UserDeclinedSignError(err?.message);
      }

      throw new WalletApiError(
        err instanceof Error ? err.message : err?.info ? err.info : err,
      );
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
