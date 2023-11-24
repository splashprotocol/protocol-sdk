import { AssetAmountSet } from '../models/assetAmountSet/AssetAmountSet.ts';
import { Bech32String } from '../types/types.ts';
import { cborHexToString } from '../utils/cborHexToString/cborHexToString.ts';
import {
  CardanoCIP30WalletBridge,
  CardanoCIP30WalletContext,
} from './CardanoCIP30WalletBridge.ts';

export type GetWalletBridge = () => Promise<CardanoCIP30WalletBridge>;

export interface Extra {
  readonly getBalance?: (
    context: CardanoCIP30WalletContext,
  ) => Promise<AssetAmountSet>;
  readonly getChangeAddress?: (
    context: CardanoCIP30WalletContext,
  ) => Promise<Bech32String>;
  readonly getUnusedAddresses?: (
    context: CardanoCIP30WalletContext,
  ) => Promise<Bech32String[]>;
  readonly getUsedAddresses?: (
    context: CardanoCIP30WalletContext,
  ) => Promise<Bech32String[]>;
}

/**
 * Wallet representation
 */
export class Wallet {
  private context: Promise<CardanoCIP30WalletContext> | undefined;

  private bridge: Promise<CardanoCIP30WalletBridge> | undefined;

  /**
   * Creates wallet structure from wallet bridge
   * @param {GetWalletBridge} getWalletBridge
   * @param {Extra} extra
   * @private
   */
  constructor(
    private getWalletBridge: GetWalletBridge,
    private extra?: Extra,
  ) {}

  private async assertBridge(): Promise<CardanoCIP30WalletBridge> {
    // if (!this.getWalletBridge) {
    //   return Promise.reject(new Error(`getWalletBridge is not a function`));
    // }
    // this.bridge = this.getWalletBridge()
    //   .then((bridge) => {
    //     if (!bridge) {
    //       throw new Error(
    //         `getWalletBridge functions returns undefined instead connector.`,
    //       );
    //     }
    //   })
    //   .catch((error: Error | string) => {
    //     this.bridge = undefined;
    //   });
    //
    // return this.bridge;
  }

  private async assertContext(): Promise<CardanoCIP30WalletContext> {
    // if (!this.context) {
    //   this.context = await this.assertBridge().enable();
    // }
    //
    // return this.context
    //   .catch((error: string | Error) =>
    //     typeof error === 'string' ? new Error(error) : error,
    //   )
    //   .then((contextOrError) => {
    //     if (contextOrError instanceof Error) {
    //       this.context = undefined;
    //       throw contextOrError;
    //     }
    //     return contextOrError;
    //   });
  }

  async getBalance(): Promise<AssetAmountSet> {
    const context = await this.assertContext();

    if (this.extra?.getBalance) {
      return this.extra.getBalance(context);
    }

    const balanceCbor = await context.getBalance();
    return AssetAmountSet.fromCborHex(balanceCbor);
  }

  async getChangeAddress(): Promise<Bech32String> {
    const context = await this.assertContext();

    if (this.extra?.getChangeAddress) {
      return this.extra?.getChangeAddress(context);
    }

    const changeAddressCbor = await context.getChangeAddress();
    return cborHexToString(changeAddressCbor);
  }

  async getUsedAddresses(): Promise<Bech32String[]> {
    const context = await this.assertContext();

    if (this.extra?.getUsedAddresses) {
      return this.extra.getUsedAddresses(context);
    }

    const addressesCbor = await context.getUsedAddresses();
    return addressesCbor.map(cborHexToString);
  }

  async getUnusedAddresses(): Promise<Bech32String[]> {
    const context = await this.assertContext();

    if (this.extra?.getUnusedAddresses) {
      return this.extra.getUnusedAddresses(context);
    }

    const addressesCbor = await context.getUnusedAddresses();
    return addressesCbor.map(cborHexToString);
  }

  async isEnabled(): Promise<boolean> {
    const bridge = await this.getWalletBridge();

    return bridge.isEnabled();
  }
}
