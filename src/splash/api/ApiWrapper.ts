import { Api } from '../../core/api/Api.ts';
import { AssetMetadata } from '../../core/api/types/common/AssetMetadata.ts';
import { GetSplashPoolsParams } from '../../core/api/types/getSplashPools/getSplashPools.ts';
import { CfmmPool } from '../../core/models/pool/cfmm/CfmmPool.ts';
import { CardanoCIP30WalletBridge } from '../../core/types/CardanoCIP30WalletBridge.ts';
import { AssetId } from '../../core/types/types.ts';
import { Splash } from '../splash.ts';
import { mapPawPoolToCfmmPool } from './splash/mappers/mapPawPoolToCfmmPool.ts';

export class ApiWrapper {
  constructor(
    private splash: Splash<any>,
    private api: Api,
    private wallet?: CardanoCIP30WalletBridge,
    private includeMetadata?: boolean,
  ) {
    console.log(this.api, this.wallet, this.includeMetadata);
  }

  /**
   * Returns asset metadata by id
   * @param {AssetId} assetId
   * @returns {Promise<AssetMetadata>}
   */
  getMetadata(assetId: AssetId): Promise<AssetMetadata | undefined> {
    return this.includeMetadata
      ? this.api.getAssetMetadata(assetId)
      : Promise.resolve(undefined);
  }

  /**
   * Returns splash pool list
   * @returns {Promise<CfmmPool[]>}
   */
  getSplashPools<P extends GetSplashPoolsParams = GetSplashPoolsParams>(
    params?: P,
  ): Promise<CfmmPool[]> {
    return this.api
      .getSplashPools(params)
      .then((pools) => pools.filter((p) => p.pool.poolType === 'cfmm'))
      .then((pools) =>
        Promise.all(
          pools.map((rawCfmmPool) => {
            return Promise.all([
              this.getMetadata(rawCfmmPool.pool.x.asset),
              this.getMetadata(rawCfmmPool.pool.y.asset),
            ]).then(([xMetadata, yMetadata]) =>
              mapPawPoolToCfmmPool(
                {
                  rawCfmmPool,
                  xMetadata,
                  yMetadata,
                },
                this.splash,
              ),
            );
          }),
        ),
      );
  }
}
