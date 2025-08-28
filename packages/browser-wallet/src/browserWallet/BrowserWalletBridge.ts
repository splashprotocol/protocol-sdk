import { BrowserWalletConfig } from './types/BrowserWalletConfig.ts';
import { BrowserWallet } from './BrowserWallet.ts';
import { Theme } from '../operations/setTheme/types/Theme.ts';
import { IFrameConnector, IFrameConnectorResponse } from './IFrameConnector.ts';
import { PrepareForTradingRequestPayload } from '../operations/prepareForTrading/types/PrepareForTradingRequestPayload.ts';
import { DeviceKeyStorage } from './services/DeviceKeysStorage.ts';
import { bytesToHex } from '@splashprotocol/core';

export class NoDeviceKeyError extends Error {}

interface InitResult {
  readonly publicKey: string;
  readonly bridge: BrowserWalletBridge;
}

export class BrowserWalletBridge {
  private static theme: Theme | undefined;

  private static bwBridgeInstance: InitResult;

  static setTheme(theme: Theme): void {
    BrowserWalletBridge.theme = theme;
  }

  static async initWithExistingKeyPair(
    config: BrowserWalletConfig,
  ): Promise<InitResult> {
    if (BrowserWalletBridge.bwBridgeInstance) {
      return BrowserWalletBridge.bwBridgeInstance;
    }

    const iframeConnector = IFrameConnector(config.walletUrl);
    if (BrowserWalletBridge.theme) {
      await iframeConnector.setTheme(BrowserWalletBridge.theme);
    }

    let storedPublicKeyData = await DeviceKeyStorage.getPublicKey();

    if (!storedPublicKeyData) {
      throw new NoDeviceKeyError('No public key found.');
    }

    const storedPublicKey = storedPublicKeyData.publicKey;

    if (!storedPublicKey) {
      throw new NoDeviceKeyError('No public key found.');
    }

    const privateKey = await DeviceKeyStorage.getPrivateKey();
    if (storedPublicKeyData.storageAccess === 'restricted' && !privateKey) {
      throw new NoDeviceKeyError('No private key found.');
    }

    BrowserWalletBridge.bwBridgeInstance = {
      publicKey: bytesToHex(storedPublicKey),
      bridge: new BrowserWalletBridge(config, iframeConnector),
    };

    return BrowserWalletBridge.bwBridgeInstance;
  }

  static async initWithNewKeyPair(
    config: BrowserWalletConfig,
  ): Promise<InitResult> {
    if (BrowserWalletBridge.bwBridgeInstance) {
      await BrowserWalletBridge.bwBridgeInstance.bridge.destroy();
    }

    const iframeConnector = IFrameConnector(config.walletUrl);
    if (BrowserWalletBridge.theme) {
      await iframeConnector.setTheme(BrowserWalletBridge.theme);
    }
    // Device key generation removed - operation no longer available
    throw new Error('Device key generation is no longer supported');
  }

  private browserWallet:
    | undefined
    | {
        payload: PrepareForTradingRequestPayload;
        instance: BrowserWallet;
      };

  private constructor(
    private readonly config: BrowserWalletConfig,
    private readonly iframeConnector: IFrameConnectorResponse,
  ) {}

  async enable(
    payload: PrepareForTradingRequestPayload,
  ): Promise<BrowserWallet> {
    if (this.browserWallet) {
      this.assertPayload(payload);
      return this.browserWallet.instance;
    }

    this.browserWallet = {
      payload,
      instance: await BrowserWallet.create(
        this.config,
        this.iframeConnector,
        payload,
      ),
    };

    return this.browserWallet.instance;
  }

  destroy(): Promise<void> {
    if (this.browserWallet) {
      return this.browserWallet.instance.destroy();
    }
    return Promise.resolve();
  }

  private assertPayload(payload: PrepareForTradingRequestPayload) {
    // Simple deep comparison for payload equality
    const currentPayload = JSON.stringify(this.browserWallet?.payload);
    const newPayload = JSON.stringify(payload);

    if (currentPayload !== newPayload) {
      throw new Error('Different payload');
    }

    return true;
  }
}

// setTheme  должен работать до инициализации трейдинга
// получение ключей должно происходить раньше
// все остальное должно быть с контекстом кошелька
//
// BrowserWalletBridge.setTheme('dark');
//
// const bw = await BrowserWalletBridge.initWithExistingKeyPair();
