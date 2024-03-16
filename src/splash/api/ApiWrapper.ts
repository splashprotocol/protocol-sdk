import { NetworkId } from '@dcspark/cardano-multiplatform-lib-browser';

import { Api } from '../../core/api/Api.ts';
import { AssetMetadata } from '../../core/api/types/common/AssetMetadata.ts';
import { GetSplashPoolsParams } from '../../core/api/types/getSplashPools/getSplashPools.ts';
import { Currencies } from '../../core/models/currencies/Currencies.ts';
import { CfmmPool } from '../../core/models/pool/cfmm/CfmmPool.ts';
import { CardanoCIP30WalletContext } from '../../core/types/CardanoCIP30WalletBridge.ts';
import { AssetId, Dictionary } from '../../core/types/types.ts';
import { Splash } from '../splash.ts';
import { InvalidWalletNetworkError } from './common/errors/InvalidWalletNetworkError.ts';
import { NoWalletError } from './common/errors/NoWalletError.ts';
import { WalletApiError } from './common/errors/WalletApiError.ts';
import { WalletEnablingError } from './common/errors/WalletEnablingError.ts';
import { mapPawPoolToCfmmPool } from './common/mappers/mapPawPoolToCfmmPool.ts';

export class ApiWrapper {
  private contextPromise: Promise<CardanoCIP30WalletContext> | undefined;

  constructor(
    private splash: Splash<any>,
    private api: Api,
    private includeMetadata?: boolean,
  ) {}

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
   * Returns asset metadata by id
   * @param {AssetId} assetId
   * @returns {Promise<AssetMetadata>}
   */
  getAssetMetadata(assetId: AssetId): Promise<AssetMetadata | undefined> {
    return this.includeMetadata
      ? this.api.getAssetMetadata(assetId)
      : Promise.resolve(undefined);
  }

  /**
   * Returns all available assets metadata
   * @returns {Promise<AssetMetadata>}
   */
  getAssetsMetadata(): Promise<Dictionary<AssetMetadata>> {
    return this.includeMetadata
      ? this.api.getAssetsMetadata()
      : Promise.resolve({});
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
        mapPawPoolToCfmmPool(
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
}
