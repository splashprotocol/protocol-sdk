import { Bech32String, Network } from '@splashprotocol/core';
import {
  CardanoCIP30WalletBridge,
  CardanoCIP30WalletContext,
} from '../../types/CardanoCIP30WalletBridge.ts';

export interface BasicApi {
  readonly network: Network;

  currentWalletFactory?:
    | (() => Promise<CardanoCIP30WalletContext> | CardanoCIP30WalletContext)
    | CardanoCIP30WalletBridge;

  selectWallet(
    walletFactory?:
      | (() => Promise<CardanoCIP30WalletContext> | CardanoCIP30WalletContext)
      | CardanoCIP30WalletBridge,
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
  getBalanceCbor(): Promise<string>;

  /**
   * Returns cip30 context
   */
  getWalletContext(): Promise<CardanoCIP30WalletContext>;

  /**
   * Utility method for error handling
   * @param promise
   */
  handleCIP30WalletError<T>(promise: Promise<T>): Promise<T>;
}
