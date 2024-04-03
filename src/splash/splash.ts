import { Api } from '../core/api/Api.ts';
import { CardanoCIP30WalletBridge } from '../core/types/CardanoCIP30WalletBridge.ts';
import { Network } from '../core/types/Network.ts';
import { Dictionary } from '../core/types/types.ts';
import { ApiWrapper, MetadataConfig } from './api/ApiWrapper.ts';
import { Operation } from './txBuilderFactory/operations/common/Operation.ts';
import { TxBuilderFactory } from './txBuilderFactory/TxBuilderFactory.ts';
import { Utils } from './utils/Utils.ts';

export interface SplashConfig<O extends Dictionary<Operation<any>>> {
  readonly includesMetadata?: MetadataConfig | boolean;
  readonly operations?: O;
}

export class Splash<O extends Dictionary<Operation<any>>> {
  /**
   * Creates new instance of splash
   * @param {Api} api
   * @param {Network} network
   * @param {SplashConfig} config
   * @returns {Splash<O>}
   */
  static new<O extends Dictionary<Operation<any>>>(
    api: Api,
    network: Network,
    config?: SplashConfig<O>,
  ): Splash<O> {
    return new Splash<O>(api, network, config);
  }

  /**
   * Splash backend api decorator
   * @type {ApiWrapper}
   */
  public readonly api: ApiWrapper;

  /**
   * Splash utils
   * @type {Utils}
   */
  public readonly utils: Utils = new Utils(this);

  public wallet?: CardanoCIP30WalletBridge;

  private readonly txBuilderFactory: TxBuilderFactory<O>;

  private constructor(
    api: Api,
    public network: Network,
    config?: SplashConfig<O>,
  ) {
    this.api = new ApiWrapper(this, api, config?.includesMetadata);
    this.txBuilderFactory = new TxBuilderFactory(network, this.api);
  }

  /**
   * Returns splash txBuilder
   * @returns {TxBuilder}
   */
  newTx(): ReturnType<typeof this.txBuilderFactory.newTx> {
    return this.txBuilderFactory.newTx();
  }

  selectWallet(wallet?: CardanoCIP30WalletBridge): void {
    this.wallet = wallet;
  }
}
