import { IFrameConnector, IFrameConnectorResponse } from './IFrameConnector.ts';
import { WalletStatus } from '../operations/getWalletStatus/types/WalletStatus.ts';
import { PinStatus } from '../operations/enterPin/types/PinStatus.ts';
import {
  Bech32String,
  CborHexString,
  Currencies,
  HexString,
  Network,
  uint,
} from '@splashprotocol/core';
import { WalletInfo } from '../operations/getWalletInfo/type/WalletInfo.ts';
import { DataSignature } from '../operations/signData/types/DataSignature.ts';

export const a = 1;

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
  | 'GET_BALANCE';

interface WalletUTxOValue {
  readonly policyId: HexString;
  readonly base16Name: HexString;
  readonly amount: string;
}

interface WalletUTxO {
  readonly address: Bech32String;
  readonly txHash: HexString;
  readonly index: string;
  readonly value: WalletUTxOValue;
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
    return new BrowserWallet(config);
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
    const result = Promise.resolve(Currencies.empty).then((balance) => {
      delete this.cache.GET_BALANCE;
      return balance;
    });
    this.cache.GET_BALANCE = result;

    return result;
  }

  async getUTxOs() {
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
        body: JSON.stringify({ pkh, offset, limit }),
      })
        .then((res) => res.json())
        .then((uTxODataConfigs: WalletUTxO[]) => {
          console.log(uTxODataConfigs?.length, 'here');
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
      });

    this.cache.GET_UTXO = result;
    return result;
  }

  async signAndSubmitTx(cbor: CborHexString) {
    return this.signTx(cbor).then((witness) => {
      console.log(witness);

      return this.submitTx();
    });
  }

  async submitTx() {
    console.log(this.config.relay);
  }

  async getStatus(): Promise<WalletStatus> {
    if (this.cache.GET_STATUS) {
      return this.cache.GET_STATUS;
    }
    const result = this.iFrameConnector.getStatus().then((status) => {
      delete this.cache.GET_STATUS;
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

  async getPublicKey(): Promise<Bech32String> {
    return this.getWalletInfo().then((walletInfo) => walletInfo.publicKey);
  }

  async getPaymentKeyHash(): Promise<Bech32String> {
    return this.getWalletInfo().then((walletInfo) => walletInfo.pkh);
  }

  async getStakeKeyHash(): Promise<Bech32String> {
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

  private async enable(): Promise<PinStatus> {
    const status = await this.getStatus();
    if (status !== 'READY_TO_SIGN') {
      delete this.cache.ENABLE;
      delete this.cache.GET_WALLET_INFO;
    }
    if (this.cache.ENABLE) {
      return this.cache.ENABLE;
    }
    const result = Promise.resolve(status).then((status) => {
      if (status === 'READY_TO_SIGN') {
        return Promise.resolve(status);
      }
      if (status === 'PIN_REQUIRED') {
        return this.iFrameConnector.enterPin();
      }
      if (status === 'SEED_REQUIRED') {
        return this.iFrameConnector.addOrGenerateSeed();
      }
      throw new Error('impossible');
    });
    this.cache.ENABLE = result;

    return result;
  }
}
