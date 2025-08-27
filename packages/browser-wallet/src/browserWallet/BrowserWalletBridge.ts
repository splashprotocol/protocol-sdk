import { BrowserWalletConfig } from './types/BrowserWalletConfig.ts';
import { BrowserWallet } from './BrowserWallet.ts';
import { Theme } from '../operations/setTheme/types/Theme.ts';
import { IFrameConnector, IFrameConnectorResponse } from './IFrameConnector.ts';
import { PrepareForTradingRequestPayload } from '../operations/prepareForTrading/types/PrepareForTradingPayload.ts';
import { DeviceKeyStorage } from './services/DeviceKeysStorage.ts';
import { bytesToHex } from '@splashprotocol/core';
import {
  DeviceKeyAllowed,
  DeviceKeyResult,
} from '../operations/generateDeviceKey/types/DeviceKeyResult.ts';

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

    const storedPublicKey =
      storedPublicKeyData.storageAccess === 'restricted'
        ? storedPublicKeyData.publicKey
        : await iframeConnector.getExistedDevicePublicKey();

    if (!storedPublicKey) {
      throw new NoDeviceKeyError('No public key found.');
    }

    // need to return publicKey
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
    const newKeysData = await iframeConnector.generateDeviceKey();
    await DeviceKeyStorage.saveKeyData(newKeysData);

    BrowserWalletBridge.bwBridgeInstance = {
      publicKey: bytesToHex(newKeysData.publicKey),
      bridge: new BrowserWalletBridge(
        config,
        iframeConnector,
        newKeysData.storageAccess === 'allowed'
          ? 'sandbox'
          : {
              privateKey: newKeysData.privateKey,
              publicKey: newKeysData.publicKey,
            },
      ),
    };

    return BrowserWalletBridge.bwBridgeInstance;
  }

  private browserWallet:
    | undefined
    | {
        payload: Omit<PrepareForTradingRequestPayload, 'deviceKeys'>;
        instance: BrowserWallet;
      };

  private constructor(
    private readonly config: BrowserWalletConfig,
    private iframeConnector: IFrameConnectorResponse,
    private deviceKeys: PrepareForTradingRequestPayload['deviceKeys'],
  ) {}

  async enable(
    payload: Omit<PrepareForTradingRequestPayload, 'deviceKeys'>,
  ): Promise<BrowserWallet> {
    if (this.browserWallet) {
      this.assertPayload(payload);
      return this.browserWallet.instance;
    }

    this.browserWallet = {
      payload,
      instance: await BrowserWallet.create(this.config, this.iframeConnector),
    };
  }

  destroy(): Promise<void> {
    if (this.browserWallet) {
      return this.browserWallet.instance.destroy();
    }
    return Promise.resolve();
  }

  private assertPayload(
    payload: Omit<PrepareForTradingRequestPayload, 'deviceKeys'>,
  ) {
    if (payload.seed?.iv !== this.browserWallet?.payload!.seed?.iv) {
      throw new Error('Different payload');
    }
    if (
      payload.seed?.ciphertext !== this.browserWallet?.payload!.seed?.ciphertext
    ) {
      throw new Error('Different payload');
    }
    if (payload.seed?.salt !== this.browserWallet?.payload!.seed?.salt) {
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
