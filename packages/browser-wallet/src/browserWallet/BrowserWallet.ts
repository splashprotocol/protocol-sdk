import { IFrameConnector, IFrameConnectorResponse } from './IFrameConnector.ts';
import {
  AssetInfo,
  Bech32String,
  CborHexString,
  Currencies,
  Currency,
  HexString,
  uint,
} from '@splashprotocol/core';
import { DataSignature } from '../operations/signData/types/DataSignature.ts';
import {
  EncryptedContainer,
  PFTReq_MasterPasswordPayload,
  PFTReq_NoSeedPayload,
  PFTReq_TemporaryContainerPayload,
  PFTReq_TradingSessionPayload,
  PrepareForTradingRequestPayload,
} from '../operations/prepareForTrading/types/PrepareForTradingRequestPayload.ts';
import { WalletInfo } from '../operations/prepareForTrading/types/PrepareForTradingResponsePayload.ts';
import { BrowserWalletConfig } from './types/BrowserWalletConfig.ts';
import { Theme } from '../operations/setTheme/types/Theme.ts';
import { DeviceSecretStorage } from './services/DeviceSecretStorage.ts';

export class SessionExpiredError extends Error {}

type CacheKey = 'GET_UTXO' | 'GET_BALANCE';

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
  private static theme: Theme | undefined;

  private static instance: BrowserWallet;

  static async setTheme(theme: Theme): Promise<void> {
    this.theme = theme;
    if (BrowserWallet.instance) {
      await BrowserWallet.instance['iFrameConnector'].setTheme(theme);
    }
  }

  static async create(
    config: BrowserWalletConfig,
    fundingWalletPkh: string,
    partialPayload:
      | PFTReq_NoSeedPayload
      | PFTReq_MasterPasswordPayload
      | Omit<PFTReq_TradingSessionPayload, 'sessionPassword'>
      | PFTReq_TemporaryContainerPayload,
  ): Promise<{
    readonly browserWallet: BrowserWallet;
    readonly newSession: EncryptedContainer | undefined;
  }> {
    if (BrowserWallet.instance) {
      await BrowserWallet.instance.destroy();
    }
    // CHECKING EXISTED SECRET
    let existedSecret = await DeviceSecretStorage.getSecret();
    if (
      existedSecret &&
      (partialPayload.type !== 'session' ||
        (partialPayload.type === 'session' &&
          fundingWalletPkh !== existedSecret.fundingWalletPkh))
    ) {
      await DeviceSecretStorage.removeSecret();
      existedSecret = undefined;
    }
    // CHECKING EXISTED END SECRET

    // START TRADING
    const fullPayload: PrepareForTradingRequestPayload =
      partialPayload.type !== 'session'
        ? partialPayload
        : existedSecret
          ? {
              ...partialPayload,
              sessionPassword:
                existedSecret.storageAccess === 'allowed'
                  ? 'sandbox'
                  : existedSecret.secret,
            }
          : {
              type: 'master-password',
              ...partialPayload.masterPasswordContainer,
            };

    const iframeConnector = IFrameConnector(config.walletUrl);
    if (BrowserWallet.theme) {
      await iframeConnector.setTheme(BrowserWallet.theme);
    }
    const prepareForTradingResult =
      await iframeConnector.prepareForTrading(fullPayload);

    if (prepareForTradingResult.type === 'new-session') {
      await DeviceSecretStorage.setSecret(
        prepareForTradingResult.sessionPassword === 'sandbox'
          ? {
              storageAccess: 'allowed',
              fundingWalletPkh,
            }
          : {
              storageAccess: 'restricted',
              fundingWalletPkh,
              secret: prepareForTradingResult.sessionPassword,
            },
      );
    }
    BrowserWallet.instance = new BrowserWallet(
      config,
      iframeConnector,
      prepareForTradingResult.info,
    );

    return {
      browserWallet: BrowserWallet.instance,
      newSession:
        prepareForTradingResult.type === 'new-session'
          ? prepareForTradingResult.sessionContainer
          : undefined,
    };
  }

  private cache: {
    [key in CacheKey]?: Promise<any> | undefined;
  } = {};

  private constructor(
    private config: BrowserWalletConfig,
    private iFrameConnector: IFrameConnectorResponse,
    private walletInfo: WalletInfo,
  ) {}

  async getBalance(): Promise<Currencies> {
    if (this.cache.GET_BALANCE) {
      return this.cache.GET_BALANCE;
    }
    await this.config.tradeSessionCheck();
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

    await this.config.tradeSessionCheck();
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

    const result = getUtxOsFromMonitor(this.walletInfo.pkh)
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

  async signTx(cbor: CborHexString): Promise<CborHexString> {
    await this.config.tradeSessionCheck();
    return this.iFrameConnector.signTx(cbor);
  }

  async signData(data: Uint8Array): Promise<DataSignature> {
    await this.config.tradeSessionCheck();
    return this.iFrameConnector.signData(data);
  }

  async destroy() {
    return this.iFrameConnector.destroy();
  }
}
