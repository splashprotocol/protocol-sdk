import { Bech32String, Currencies, Network } from '@splashprotocol/core';
import {
  CardanoCIP30WalletBridge,
  CardanoCIP30WalletContext,
} from '../../types/CardanoCIP30WalletBridge.ts';
import { BrowserWallet } from '@splashprotocol/browser-wallet';

export interface BasicApi {
  readonly network: Network;

  currentWalletFactory?:
    | (() => Promise<CardanoCIP30WalletContext> | CardanoCIP30WalletContext)
    | CardanoCIP30WalletBridge;

  selectWallet(
    walletFactory?:
      | (() => Promise<CardanoCIP30WalletContext> | CardanoCIP30WalletContext)
      | CardanoCIP30WalletBridge
      | BrowserWallet,
  ): void;

  /**
   * Returns all wallet addresses
   * @return {Promise<string>}
   */
  getAddresses(): Promise<Bech32String[]>;

  /**
   * Returns active wallet address
   * @return {Promise<string>}
   */
  getActiveAddress(): Promise<Bech32String>;

  /**
   * Returns all wallet pkhs
   * @return {Promise<string>}
   */
  getPaymentKeysHashes(): Promise<string[]>;

  /**
   * Returns current wallet balance
   * @returns {Promise<Currencies>}
   */
  getBalanceInner(): Promise<Currencies>;

  /**
   * Returns cip30 context
   */
  getWalletContext(): Promise<CardanoCIP30WalletContext | BrowserWallet>;

  /**
   * Utility method for error handling
   * @param promise
   */
  handleCIP30WalletError<T>(promise: Promise<T>): Promise<T>;

  /**
   * Utility method for browser error handling
   * @param promise
   */
  handleBrowserWalletError<T>(promise: Promise<T>): Promise<T>;
}
