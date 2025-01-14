import {
  Address,
  BaseAddress,
  hash_transaction,
  NetworkId,
  Transaction as WasmTransaction,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { RawLiquidityRedeemOrder } from '../../../build';
import { Api } from '../../core/api/Api.ts';
import { AssetMetadata } from '../../core/api/types/common/AssetMetadata.ts';
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
import { PoolChartPoint } from '../../core/models/poolChartPoint/PoolChartPoint.ts';
import { Price } from '../../core/models/price/Price.ts';
import { RecentTrade } from '../../core/models/recentTrade/RecentTrade.ts';
import { SignedTransaction } from '../../core/models/signedTransaction/SignedTransaction.ts';
import { TradeOrder } from '../../core/models/tradeOrder/TradeOrder.ts';
import { Transaction } from '../../core/models/transaction/Transaction.ts';
import { UTxO } from '../../core/models/utxo/UTxO.ts';
import {
  CardanoCIP30WalletBridge,
  CardanoCIP30WalletContext,
} from '../../core/types/CardanoCIP30WalletBridge.ts';
import { NetworkContext } from '../../core/types/NetworkContext.ts';
import { ProtocolParams } from '../../core/types/ProtocolParams.ts';
import {
  AssetId,
  CborHexString,
  Dictionary,
  HexString,
  TransactionHash,
  uint,
} from '../../core/types/types.ts';
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
  readonly ipfsGateway?: string;
  // Update time in milliseconds: Default 300_000
  readonly updateTime: number;
  // Default metadata value. Field will be useful with ssr
  readonly defaultValue?:
    | Dictionary<AssetMetadata>
    | Promise<Dictionary<AssetMetadata>>;
}

const DEFAULT_UPDATE_TIME = 300_000;

export class ApiWrapper {
  private currentWallet: CardanoCIP30WalletBridge | undefined;

  private contextPromise: Promise<CardanoCIP30WalletContext> | undefined;

  private assetsMetadataCache: Promise<Dictionary<AssetMetadata>> | undefined;

  private protocolParamsCacheP: Promise<ProtocolParams> | undefined;

  private assetsMetadataLastUpdateTime?: number;

  private includeMetadata: boolean;

  private ipfsGateway?: string;

  private metadataUpdateTime: number;

  private metadataCache = new Map<
    AssetId,
    Promise<AssetMetadata | undefined>
  >();

  private metadataRequestsCache = new Map<
    AssetId,
    Promise<AssetMetadata | undefined>
  >();

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
    this.ipfsGateway = normalizedMetadataConfig.ipfsGateway;
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
          raw: '0',
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
    return this.api.getRecentTrades(params).then((rawRecentTrades) => {
      return Promise.all([
        this.getAssetMetadata(params.base.splashId),
        this.getAssetMetadata(params.quote.splashId),
      ]).then(([baseMetadata, quoteMetadata]) => ({
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
      }));
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
      data: data.map((item) => ({
        value: Currency.ada(BigInt(item.value)),
        timestamp: item.timestamp,
      })),
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
      data: data.map((item) => ({
        value: Currency.ada(BigInt(item.value)),
        timestamp: item.timestamp,
      })),
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
      data: data.map((item) => ({
        value: Currency.ada(BigInt(item.value)),
        timestamp: item.timestamp,
      })),
    }));
  }

  /**
   * Returns signed transaction
   * @param {Transaction} transaction
   * @return {Promise<SignedTransaction>}
   */
  async sign(transaction: Transaction): Promise<SignedTransaction> {
    // console.log('pure', transaction.wasm.build_unchecked().to_cbor_hex());
    // console.log(
    //   'pure cannonical',
    //   transaction.wasm.build_unchecked().to_canonical_cbor_hex(),
    // );
    // console.log(
    //   'patched cannonical',
    //   WasmTransaction.from_cbor_hex(
    //     transaction.wasm.build_unchecked().to_canonical_cbor_hex(),
    //   ).to_cbor_hex(),
    // );

    return Promise.all([
      this.getWalletContext().then((ctx) =>
        this.handleCIP30WalletError(
          ctx.signTx(
            WasmTransaction.from_cbor_hex(
              transaction.wasm.build_unchecked().to_canonical_cbor_hex(),
            ).to_cbor_hex(),
            transaction.partialSign,
          ),
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
    const wasmTx = WasmTransaction.from_cbor_hex(
      signedTransaction.wasm.to_canonical_cbor_hex(),
    );

    fetch('https://splash-submit-api.splash.trade/tx/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/cbor',
        Accept: 'text/plain',
      },
      body: wasmTx.to_cbor_bytes(),
    }).then(() => hash_transaction(wasmTx.body()).to_hex());

    return this.getWalletContext().then((ctx) =>
      this.handleCIP30WalletError(ctx.submitTx(wasmTx.to_cbor_hex())),
    );
  }

  async signMessage(
    data: CborHexString,
    address?: CborHexString,
  ): Promise<{ key: HexString; signature: HexString }> {
    return this.getWalletContext().then((ctx) =>
      ctx
        .getChangeAddress()
        .then((changeAddressCbor) =>
          ctx.signData(address || changeAddressCbor, data),
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
    return this.api.getOrderBook(params).then((orderBook) => {
      return Promise.all([
        this.getAssetMetadata(params.base.splashId),
        this.getAssetMetadata(params.quote.splashId),
      ]).then(([baseMetadata, quoteMetadata]) =>
        mapRawOrderBookToOrderBook({
          rawOrderBook: orderBook,
          baseMetadata,
          quoteMetadata,
        }),
      );
    });
  }

  /**
   * Returns 5 top trading pool info
   * @return {Promise<TrendPool[]>}
   */
  async getTrendPools(): Promise<TrendPool[]> {
    return this.api.getTrendPools().then((trendPools) => {
      return Promise.all(
        trendPools.map((rawTrendPool) =>
          Promise.all([
            this.getAssetMetadata(rawTrendPool.x),
            this.getAssetMetadata(rawTrendPool.y),
          ]).then(([xMetadata, yMetadata]) =>
            mapRawTrendPoolToTrendPool({
              rawTrendPool,
              xMetadata,
              yMetadata,
            }),
          ),
        ),
      );
    });
  }

  /**
   * Returns available pair list
   * @return {Promise<Pair[]>}
   */
  async getPairs(): Promise<Pair[]> {
    return this.api.getPairs().then((rawPairs) => {
      return Promise.all(
        rawPairs.map((rawPair) =>
          Promise.all([
            this.getAssetMetadata(rawPair.base),
            this.getAssetMetadata(rawPair.quote),
          ]).then(([baseMetadata, quoteMetadata]) =>
            mapRawPairToPair({
              rawPair,
              baseMetadata,
              quoteMetadata,
            }),
          ),
        ),
      );
    });
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
    return this.getWalletContext()
      .then((ctx) => this.handleCIP30WalletError(ctx.getBalance()))
      .then((cborBalance) => {
        return Currencies.fromCborHexStringAndMetadataFactory(
          cborBalance,
          (assetId) => this.getAssetMetadata(assetId),
        );
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
   * @returns {Promise<Dictionary<AssetMetadata>>}
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
   * Returns assets metadata by asset id
   * @param {AssetId} assetId
   * @returns {Promise<AssetMetadata>}
   */
  getAssetMetadata(assetId: AssetId): Promise<AssetMetadata | undefined> {
    if (!this.includeMetadata) {
      return Promise.resolve(undefined);
    }
    if (AssetInfo.ada.splashId === assetId) {
      return Promise.resolve(AssetInfo.ada.metadata);
    }
    if (this.metadataCache.has(assetId)) {
      return this.metadataCache.get(assetId)!;
    }
    if (this.metadataRequestsCache.has(assetId)) {
      return this.metadataRequestsCache.get(assetId)!;
    }

    return this.getAssetsMetadata().then((metadata) => {
      if (metadata[assetId]) {
        return metadata[assetId];
      }
      const oneAssetPromise = this.api
        .getAssetMetadata(assetId)
        .then((assetMetadata) => {
          let normalizedAssetMetadata: AssetMetadata | undefined;
          if (assetMetadata) {
            normalizedAssetMetadata = {
              ...assetMetadata,
              logo: assetMetadata.logo
                ? assetMetadata.logo
                : assetMetadata.logoCid && this.ipfsGateway
                ? `${this.ipfsGateway}/${assetMetadata.logoCid}`
                : undefined,
              snekdotfun: assetMetadata.launchedBy === 'snekdotfun',
            };
            this.metadataCache.set(assetId, oneAssetPromise as any);
          } else {
            normalizedAssetMetadata = undefined;
            this.metadataCache.set(assetId, oneAssetPromise as any);
          }
          this.metadataRequestsCache.delete(assetId);

          return normalizedAssetMetadata;
        });
      this.metadataRequestsCache.set(assetId, oneAssetPromise);

      return oneAssetPromise;
    });
  }

  /**
   * Returns splash pool list
   * @returns {Promise<CfmmPool[]>}
   */
  getSplashPools<P extends GetSplashPoolsParams = GetSplashPoolsParams>(
    params?: P,
  ): Promise<(CfmmPool | WeightedPool | StablePool)[]> {
    return this.api.getSplashPools(params).then((pools) => {
      return Promise.all(
        pools.map((rawPool) =>
          Promise.all([
            this.getAssetMetadata(rawPool.pool.x.asset),
            this.getAssetMetadata(rawPool.pool.y.asset),
          ]).then(([xMetadata, yMetadata]) =>
            mapRawPoolToPool(
              {
                rawPool: rawPool,
                xMetadata,
                yMetadata,
              },
              this.splash,
            ),
          ),
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
    return this.getPaymentKeysHashes()
      .then((paymentKeyHashes) =>
        this.api.getTradeOpenOrders({
          paymentKeyHashes,
        }),
      )
      .then((trades) => {
        return Promise.all(
          trades.orders.map((trade) =>
            Promise.all([
              this.getAssetMetadata(trade.input),
              this.getAssetMetadata(trade.output),
            ]).then(([inputMetadata, outputMetadata]) =>
              mapRawTradeOrderToTradeOrder(
                {
                  rawTradeOrder: trade,
                  inputMetadata,
                  outputMetadata,
                },
                this.splash,
              ),
            ),
          ),
        ).then((operations) => ({ operations, count: trades.count }));
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
    return this.getPaymentKeysHashes()
      .then((paymentKeyHashes) =>
        this.api.getTradeOrders({
          limit: params.limit,
          offset: params.offset,
          paymentKeyHashes,
        }),
      )
      .then((trades) => {
        return Promise.all(
          trades.orders.map((trade) =>
            Promise.all([
              this.getAssetMetadata(trade.input),
              this.getAssetMetadata(trade.output),
            ]).then(([inputMetadata, outputMetadata]) =>
              mapRawTradeOrderToTradeOrder(
                {
                  rawTradeOrder: trade,
                  inputMetadata,
                  outputMetadata,
                },
                this.splash,
              ),
            ),
          ),
        ).then((operations) => ({ operations, count: trades.count }));
      });
  }

  /**
   * Returns orders mempool
   * @return {Promise<(TradeOrder | DepositLiquidityOrder | RedeemLiquidityOrder)[]>}
   */
  async getOrdersMempool(): Promise<
    (TradeOrder | DepositLiquidityOrder | RedeemLiquidityOrder)[]
  > {
    return this.getPaymentKeysHashes()
      .then((paymentKeyHashes) =>
        this.api.getOrdersMempool({
          paymentKeyHashes,
        }),
      )
      .then((orders) => {
        return Promise.all(
          orders.map((rawOrder) => {
            if (
              rawOrder.orderType === 'cfmmDeposit' ||
              rawOrder.orderType === 'weightedDeposit' ||
              rawOrder.orderType === 'stableDeposit'
            ) {
              return Promise.all([
                this.getAssetMetadata(rawOrder.x.asset),
                this.getAssetMetadata(rawOrder.y.asset),
              ]).then(([metadataX, metadataY]) =>
                mapRawLiquidityOrderToLiquidityOrder(
                  {
                    rawLiquidityOrder: rawOrder,
                    metadataX,
                    metadataY,
                  },
                  this.splash,
                ),
              );
            }
            if (
              rawOrder.orderType === 'cfmmRedeem' ||
              rawOrder.orderType === 'weightedRedeem' ||
              rawOrder.orderType === 'stableRedeem'
            ) {
              return Promise.all([
                this.getAssetMetadata(rawOrder.xAsset),
                this.getAssetMetadata(rawOrder.yAsset),
              ]).then(([metadataX, metadataY]) =>
                mapRawLiquidityOrderToLiquidityOrder(
                  {
                    rawLiquidityOrder: rawOrder,
                    metadataX,
                    metadataY,
                  },
                  this.splash,
                ),
              );
            }

            const rawTradeOrder = rawOrder as RawTradeOrder;

            return Promise.all([
              this.getAssetMetadata(rawTradeOrder.input),
              this.getAssetMetadata(rawTradeOrder.output),
            ]).then(([inputMetadata, outputMetadata]) =>
              mapRawTradeOrderToTradeOrder(
                {
                  rawTradeOrder: rawTradeOrder,
                  inputMetadata,
                  outputMetadata,
                },
                this.splash,
              ),
            );
          }),
        );
      });
  }

  /**
   * Returns orders list using limit and asset
   * @param {Omit<GetLiquidityOrdersParams, 'paymentKeyHashes'>} params
   * @return {Promise<{count: number, operations: (RedeemLiquidityOrder | DepositLiquidityOrder)[]}>}
   */
  async getLiquidityOrders(
    params: Omit<GetLiquidityOrdersParams, 'paymentKeyHashes'>,
  ): Promise<{
    count: number;
    operations: (RedeemLiquidityOrder | DepositLiquidityOrder)[];
  }> {
    return this.getPaymentKeysHashes()
      .then((paymentKeyHashes) =>
        this.api.getLiquidityOrders({
          limit: params.limit,
          offset: params.offset,
          paymentKeyHashes,
        }),
      )
      .then((orders) => {
        return Promise.all(
          orders.order.map((rawLiquidityOrder) => {
            if (
              rawLiquidityOrder.orderType === 'cfmmDeposit' ||
              rawLiquidityOrder.orderType === 'weightedDeposit' ||
              rawLiquidityOrder.orderType === 'stableDeposit'
            ) {
              return Promise.all([
                this.getAssetMetadata(rawLiquidityOrder.x.asset),
                this.getAssetMetadata(rawLiquidityOrder.y.asset),
              ]).then(([metadataX, metadataY]) =>
                mapRawLiquidityOrderToLiquidityOrder(
                  {
                    rawLiquidityOrder,
                    metadataX,
                    metadataY,
                  },
                  this.splash,
                ),
              );
            }
            const rawLiquidityRedeemOrder =
              rawLiquidityOrder as RawLiquidityRedeemOrder;

            return Promise.all([
              this.getAssetMetadata(rawLiquidityRedeemOrder.xAsset),
              this.getAssetMetadata(rawLiquidityRedeemOrder.yAsset),
            ]).then(([metadataX, metadataY]) =>
              mapRawLiquidityOrderToLiquidityOrder(
                {
                  rawLiquidityOrder,
                  metadataX,
                  metadataY,
                },
                this.splash,
              ),
            );
          }),
        ).then((operations) => ({
          operations,
          count: orders.count,
        }));
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
      this.clearCache();
      return Promise.reject(new NoWalletError('please, provide wallet to sdk'));
    }
    if (this.splash.wallet !== this.currentWallet) {
      console.log('new wallet');
      this.clearCache();
    }
    if (!this.contextPromise) {
      let timerId: any = undefined;
      this.currentWallet = this.splash.wallet;
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
          this.clearCache();
          throw err;
        });
    }
    return this.contextPromise!;
  }

  private async handleCIP30WalletError<T>(promise: Promise<T>): Promise<T> {
    return promise.catch((err) => {
      this.clearCache();
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

  private clearCache() {
    if (this.contextPromise) {
      this.currentWallet = undefined;
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
          ipfsGateway: metadataConfig.ipfsGateway,
        }
      : { updateTime: DEFAULT_UPDATE_TIME };
  }
}
