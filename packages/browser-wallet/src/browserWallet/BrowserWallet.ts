import { IFrameConnector, IFrameConnectorResponse } from './IFrameConnector.ts';
import { CborHexString } from '@splashprotocol/core';
import { DataSignature } from '../operations/signData/types/DataSignature.ts';
import { Theme } from '../operations/setTheme/types/Theme.ts';
import { PrepareForTradingRequestPayload } from '../operations/prepareForTrading/types/PrepareForTradingPayload.ts';
import { PrepareForTradingResult } from '../operations/prepareForTrading/types/PrepareForTradingResult.ts';
import { DeviceKeyResult } from '../operations/generateDeviceKey/types/DeviceKeyResult.ts';

export interface BrowserWalletConfig {
  readonly walletUrl: string;
  readonly uTxOMonitorUrl: string;
  readonly submitUrl: string;
}

export class BrowserWallet {
  private static instance: BrowserWallet;
  private iFrameConnector: IFrameConnectorResponse;

  static getInstance(config: BrowserWalletConfig): BrowserWallet {
    if (!BrowserWallet.instance) {
      BrowserWallet.instance = new BrowserWallet(config);
    }
    return BrowserWallet.instance;
  }

  private constructor(config: BrowserWalletConfig) {
    this.iFrameConnector = IFrameConnector(config.walletUrl);
  }

  async signTx(cbor: CborHexString): Promise<CborHexString> {
    return this.iFrameConnector.signTx(cbor);
  }

  async signData(data: Uint8Array): Promise<DataSignature> {
    return this.iFrameConnector.signData(data);
  }

  async setTheme(theme: Theme): Promise<void> {
    return this.iFrameConnector.setTheme(theme);
  }

  async prepareForTrading(payload: PrepareForTradingRequestPayload): Promise<PrepareForTradingResult> {
    return this.iFrameConnector.prepareForTrading(payload);
  }

  async generateDeviceKey(): Promise<DeviceKeyResult> {
    return this.iFrameConnector.generateDeviceKey();
  }

  destroy(): void {
    this.iFrameConnector.destroy();
  }
}
