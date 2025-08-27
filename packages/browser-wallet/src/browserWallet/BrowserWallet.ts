import { IFrameConnectorResponse } from './IFrameConnector.ts';
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
import { PrepareForTradingRequestPayload } from '../operations/prepareForTrading/types/PrepareForTradingPayload.ts';
import { PrepareForTradingResult } from '../operations/prepareForTrading/types/PrepareForTradingResult.ts';
import { BrowserWalletConfig } from './types/BrowserWalletConfig.ts';

type CacheKey = 'GET_UTXO' | 'GET_BALANCE' | 'PREPARE_FOR_TRADING';

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
  private cache: {
    [key in CacheKey]?: Promise<any> | undefined;
  } = {};

  static async create(
    config: BrowserWalletConfig,
    iframeConnector: IFrameConnectorResponse,
    prepareForTradingPayload: PrepareForTradingRequestPayload,
  ): Promise<BrowserWallet> {
    const prepareForTradingResult = await iframeConnector.prepareForTrading(
      prepareForTradingPayload,
    );

    return new BrowserWallet(
      config,
      iframeConnector,
      prepareForTradingResult,
      prepareForTradingPayload,
    );
  }

  private constructor(
    private config: BrowserWalletConfig,
    private iFrameConnector: IFrameConnectorResponse,
    private prepareForTradingResult: PrepareForTradingResult,
    private prepareForTradingPayload: PrepareForTradingRequestPayload,
  ) {}

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

    const result = getUtxOsFromMonitor(this.prepareForTradingResult.pkh)
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
    return this.iFrameConnector.signTx(cbor);
  }

  async signData(data: Uint8Array): Promise<DataSignature> {
    return this.iFrameConnector.signData(data);
  }

  async getExistedDevicePublicKey(): Promise<Uint8Array | undefined> {
    return this.iFrameConnector.getExistedDevicePublicKey();
  }

  async destroy() {
    return this.iFrameConnector.destroy();
  }
}
