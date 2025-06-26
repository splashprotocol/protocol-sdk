import { IFrameConnector, IFrameConnectorResponse } from './IFrameConnector.ts';
import { WalletStatus } from '../operations/getWalletStatus/types/WalletStatus.ts';
import { PinStatus } from '../operations/enterPin/types/PinStatus.ts';
import {
  AssetInfo,
  Bech32String,
  CborHexString,
  Currencies,
  BaseAddress,
  Currency,
  HexString,
  Network,
  uint,
  CredentialType,
} from '@splashprotocol/core';
import { WalletInfo } from '../operations/getWalletInfo/type/WalletInfo.ts';
import { DataSignature } from '../operations/signData/types/DataSignature.ts';
import { Theme } from '../operations/setTheme/types/Theme.ts';

export class DisconnectError extends Error {}

export interface BrowserWalletBaseConfig {
  readonly relay: 'splash' | 'snekfun' | 'none' | { url: string };
}

export interface BrowserConfig extends BrowserWalletBaseConfig {
  readonly walletUrl: string;
  readonly uTxOMonitorUrl: string;
}

type CacheKey =
  | 'GET_STATUS'
  | 'ENABLE'
  | 'GET_WALLET_INFO'
  | 'GET_UTXO'
  | 'GET_BALANCE'
  | 'UNBIND_SEED'
  | 'SET_THEME';

interface WalletUTxOValue {
  readonly policyId: HexString;
  readonly base16Name: HexString;
  readonly amount: string;
}

interface WalletUTxO {
  readonly address: Bech32String;
  readonly txHash: HexString;
  readonly index: string;
  readonly value: WalletUTxOValue[];
}

export class BrowserWallet {
  private static instance: BrowserWallet;

  static getInstance(config: BrowserWalletBaseConfig) {
    if (BrowserWallet.instance) {
      return BrowserWallet.instance;
    }
    return new BrowserWallet({
      walletUrl: '',
      uTxOMonitorUrl: '',
      ...config,
    });
  }

  static createCustom(config: BrowserConfig) {
    if (BrowserWallet.instance) {
      return BrowserWallet.instance;
    }
    const instance = new BrowserWallet(config);
    BrowserWallet.instance = instance;

    return instance;
  }

  private cache: {
    [key in CacheKey]?: Promise<any> | undefined;
  } = {};

  private iFrameConnector: IFrameConnectorResponse;

  private constructor(private config: BrowserConfig) {
    this.iFrameConnector = IFrameConnector(config.walletUrl);
  }

  async getBalance(): Promise<Currencies> {
    if (this.cache.GET_BALANCE) {
      return this.cache.GET_BALANCE;
    }
    const result = this.getUTxOs()
      .then((uTxOs) => {
        return uTxOs.reduce((balance, uTxO) => {
          return balance.plus(
            uTxO.value.map((item) =>
              Currency.new(
                BigInt(item.amount),
                item.policyId === '' && item.base16Name === ''
                  ? AssetInfo.ada
                  : AssetInfo.fromBase16(item.policyId, item.base16Name),
              ),
            ),
          );
        }, Currencies.empty);
      })
      .then((balance) => {
        delete this.cache.GET_BALANCE;
        return balance;
      })
      .catch((err) => {
        delete this.cache.GET_BALANCE;
        throw err;
      });
    this.cache.GET_BALANCE = result;

    return result;
  }

  async getUTxOs(): Promise<WalletUTxO[]> {
    if (this.cache.GET_UTXO) {
      return this.cache.GET_UTXO;
    }

    const getUtxOsFromMonitor = async (
      pkh: string,
      limit: uint = 100,
      offset: uint = 0,
    ): Promise<WalletUTxO[]> => {
      return fetch(this.config.uTxOMonitorUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pkh, offset, limit, query: 'Unspent' }),
      })
        .then((res) => res.json())
        .then((uTxODataConfigs: WalletUTxO[]) => {
          if (uTxODataConfigs.length < limit) {
            return uTxODataConfigs;
          }
          return getUtxOsFromMonitor(pkh, offset + limit, limit).then(
            (nextUtxoDataConfigs) =>
              uTxODataConfigs.concat(nextUtxoDataConfigs),
          );
        });
    };

    const result = this.getWalletInfo()
      .then((walletInfo) => getUtxOsFromMonitor(walletInfo.pkh))
      .then((uTxOs) => {
        delete this.cache.GET_UTXO;

        return uTxOs;
      })
      .catch((err) => {
        delete this.cache.GET_UTXO;

        throw err;
      });

    this.cache.GET_UTXO = result;
    return result;
  }

  async submitTx() {
    console.log(this.config.relay);
  }

  async getStatus(): Promise<WalletStatus> {
    if (this.cache.GET_STATUS) {
      return this.cache.GET_STATUS;
    }
    const result = this.iFrameConnector.getStatus().then((status) => {
      setTimeout(
        () => {
          console.log('clear status');
          delete this.cache.GET_STATUS;
        },
        10 * 60 * 1000,
      );
      return status;
    });
    this.cache.GET_STATUS = result;

    return result;
  }

  async signTx(cbor: CborHexString): Promise<CborHexString> {
    return this.enable().then(() => this.iFrameConnector.signTx(cbor));
  }

  async signData(data: Uint8Array): Promise<DataSignature> {
    return this.enable().then(() => this.iFrameConnector.signData(data));
  }

  async getAddress(): Promise<Bech32String> {
    return this.getWalletInfo().then((walletInfo) =>
      BaseAddress.fromCredentials(
        1,
        { type: CredentialType.KeyHash, hash: walletInfo.pkh },
        { type: CredentialType.KeyHash, hash: walletInfo.skh },
      ).toBech32(),
    );
  }

  async getPublicKey(): Promise<HexString> {
    return this.getWalletInfo().then((walletInfo) => walletInfo.publicKey);
  }

  async getPaymentKeyHash(): Promise<HexString> {
    return this.getWalletInfo().then((walletInfo) => walletInfo.pkh);
  }

  async getStakeKeyHash(): Promise<HexString> {
    return this.getWalletInfo().then((walletInfo) => walletInfo.skh);
  }

  async getNetwork(): Promise<Network> {
    return this.getWalletInfo().then((walletInfo) => walletInfo.network);
  }

  private async getWalletInfo(): Promise<WalletInfo> {
    if (this.cache.GET_WALLET_INFO) {
      return this.cache.GET_WALLET_INFO;
    }
    const result = this.enable().then(() =>
      this.iFrameConnector.getWalletInfo(),
    );

    this.cache.GET_WALLET_INFO = result;

    return result;
  }

  async setTheme(theme: Theme): Promise<void> {
    if (this.cache.SET_THEME) {
      this.cache.SET_THEME;
    }
    const result = this.iFrameConnector
      .setTheme(theme)
      .then(() => {
        delete this.cache.SET_THEME;
      })
      .catch((err) => {
        delete this.cache.SET_THEME;
        throw err;
      });
    this.cache.SET_THEME = result;

    return result;
  }

  async unbindSeed(): Promise<WalletStatus> {
    if (this.cache.UNBIND_SEED) {
      return this.cache.UNBIND_SEED;
    }
    const result = this.enable()
      .then(() => this.iFrameConnector.removeSeedPhrase())
      .then((status) => {
        this.cache = {};
        return status;
      })
      .catch((err) => {
        this.cache = {};

        throw err;
      });

    this.cache.UNBIND_SEED = result;

    return result;
  }

  private async enable(): Promise<PinStatus> {
    const status = await this.getStatus();
    if (status !== 'READY_TO_SIGN') {
      this.cache = {};
    }
    if (this.cache.ENABLE) {
      return this.cache.ENABLE;
    }
    const result = Promise.resolve(status).then((status) => {
      if (status === 'READY_TO_SIGN') {
        return Promise.resolve(status);
      }
      if (status === 'PIN_REQUIRED') {
        return this.iFrameConnector.enterPin().then((status) => {
          if (status === 'DISCONNECT') {
            this.cache = {};
            throw new DisconnectError();
          }
          return status;
        });
      }
      if (status === 'SEED_REQUIRED') {
        return this.iFrameConnector.addOrGenerateSeed().catch(() => {
          this.cache = {};
          throw new DisconnectError();
        });
      }
      this.cache = {};
      throw new DisconnectError('impossible');
    });
    this.cache.ENABLE = result;

    return result;
  }
}
