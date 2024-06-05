import { Api } from '../core/api/Api.ts';
import { Transaction } from '../core/models/transaction/Transaction.ts';
import { CardanoCIP30WalletBridge } from '../core/types/CardanoCIP30WalletBridge.ts';
import { Network } from '../core/types/Network.ts';
import { SplashOperationsConfig } from '../core/types/SplashOperationsConfig.ts';
import { CborHexString, Dictionary } from '../core/types/types.ts';
import { ApiWrapper, MetadataConfig } from './api/ApiWrapper.ts';
import { Operation } from './txBuilderFactory/operations/common/Operation.ts';
import {
  defaultOperations,
  TxBuilder,
  TxBuilderFactory,
} from './txBuilderFactory/TxBuilderFactory.ts';
import { RemoteCollateral } from './txBuilderFactory/types/RemoteCollateral.ts';
import { Utils } from './utils/Utils.ts';

export interface RemoteCollateralsConfig {
  getCollaterals(): Promise<RemoteCollateral[]>;
  sign(transaction: Transaction): Promise<CborHexString>;
}

export interface SplashConfig<O extends Dictionary<Operation<any>>> {
  readonly includesMetadata?: MetadataConfig | boolean;
  readonly operations?: O;
  readonly remoteCollaterals?: RemoteCollateralsConfig;
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
  public readonly utils: Utils;

  public wallet?: CardanoCIP30WalletBridge;

  private readonly txBuilderFactory: TxBuilderFactory<O>;

  // TODO: THINK ABOUT ABSTRACTION
  readonly operationsConfig: Promise<SplashOperationsConfig> = fetch(
    'https://spectrum.fi/settings.json',
  ).then((res) => res.json());

  protected readonly remoteCollaterals?: RemoteCollateralsConfig;

  private constructor(
    api: Api,
    public network: Network,
    config?: SplashConfig<O>,
  ) {
    this.api = new ApiWrapper(this, api, config?.includesMetadata);
    this.utils = new Utils(this);
    this.txBuilderFactory = new TxBuilderFactory(this, config?.operations);
    this.remoteCollaterals = config?.remoteCollaterals;
  }

  /**
   * Returns splash txBuilder
   * @returns {TxBuilder}
   */
  newTx(): TxBuilder<O & typeof defaultOperations> {
    return this.txBuilderFactory.newTx();
  }

  selectWallet(wallet?: CardanoCIP30WalletBridge): void {
    this.wallet = wallet;
  }
}
