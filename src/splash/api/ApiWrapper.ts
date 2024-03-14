import { Api } from '../../core/api/Api.ts';
import { AssetMetadata } from '../../core/api/types/common/AssetMetadata.ts';
import { GetSplashPoolsParams } from '../../core/api/types/getSplashPools/getSplashPools.ts';
import { Currencies } from '../../core/models/currencies/Currencies.ts';
import { CfmmPool } from '../../core/models/pool/cfmm/CfmmPool.ts';
import { AssetId, Dictionary } from '../../core/types/types.ts';
import { Splash } from '../splash.ts';
import { mapPawPoolToCfmmPool } from './splash/mappers/mapPawPoolToCfmmPool.ts';

export class ApiWrapper {
  constructor(
    private splash: Splash<any>,
    private api: Api,
    private includeMetadata?: boolean,
  ) {}

  /**
   * Get current wallet balance
   * @returns {Promise<Currencies>}
   */
  getBalance(): Promise<Currencies> {
    if (!this.splash.wallet) {
      console.warn('wallet is not connected');
      return Promise.resolve().then(() => Currencies.empty);
    }

    return Promise.all([
      this.getAssetsMetadata(),
      this.splash.wallet.enable().then((ctx) => ctx.getBalance()),
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
}
