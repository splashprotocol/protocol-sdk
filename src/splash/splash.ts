import { Api } from '../core/api/Api.ts';
import { Network } from '../core/types/Network.ts';
import { Dictionary } from '../core/types/types.ts';
import { ApiWrapper } from './api/ApiWrapper.ts';
import { Operation } from './txBuilderFactory/operations/common/Operation.ts';
import { TxBuilderFactory } from './txBuilderFactory/TxBuilderFactory.ts';
import { WalletManager } from './walletManager/WalletManager.ts';

export interface SplashConfig<O extends Dictionary<Operation<any>>> {
  readonly includesMetadata?: boolean;
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
   * Splash wallet manager
   * @type {WalletManager}
   */
  public readonly wallet: WalletManager;

  private readonly txBuilderFactory: TxBuilderFactory<O>;

  private constructor(api: Api, network: Network, config?: SplashConfig<O>) {
    this.api = new ApiWrapper(api, config?.includesMetadata);
    this.wallet = new WalletManager(network);
    this.txBuilderFactory = new TxBuilderFactory(network);
  }

  /**
   * Returns splash txBuilder
   * @returns {TxBuilder}
   */
  newTx(): ReturnType<typeof this.txBuilderFactory.newTx> {
    return this.txBuilderFactory.newTx();
  }
}

const a = Splash.new();

a.newTx().payToAddress('', 2);
