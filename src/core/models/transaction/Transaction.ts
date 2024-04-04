import { SignedTxBuilder } from '@dcspark/cardano-multiplatform-lib-browser';

import { Splash } from '../../../splash/splash.ts';
import { CborHexString, TransactionHash } from '../../types/types.ts';
import { SignedTransaction } from '../signedTransaction/SignedTransaction.ts';

export interface TransactionConfig {
  readonly transaction: SignedTxBuilder;
  readonly partialSign?: boolean;
}

/**
 * Transaction representation
 */
export class Transaction {
  /**
   * Creates new instance of Transaction from WasmTransaction | TransactionCbor
   * @param {TransactionConfig} config
   * @param {Splash<{}>} splash
   * @return {Transaction}
   */
  static new(config: TransactionConfig, splash: Splash<{}>) {
    return new Transaction(config, splash);
  }

  /**
   * Request only partial sign flag
   * @type {boolean}
   */
  readonly partialSign?: boolean;

  /**
   * Wasm Transaction structure
   * @type {Transaction}
   */
  readonly wasm: SignedTxBuilder;

  /**
   * Splash client. Producer of transaction
   * @type {Splash<{}>}
   */
  readonly splash: Splash<{}>;

  /**
   * Returns transaction cbor
   * @return {string}
   */
  get cbor(): CborHexString {
    return this.wasm.build_unchecked().to_cbor_hex();
  }

  private constructor(
    { transaction, partialSign }: TransactionConfig,
    splash: Splash<{}>,
  ) {
    this.wasm = transaction;
    this.partialSign = partialSign;
    this.splash = splash;
  }

  /**
   * Sign current tx using connector
   * @return {Promise<SignedTransaction>}
   */
  async sign(): Promise<SignedTransaction> {
    return this.splash.api.sign(this);
  }

  /**
   * Sign and submit current tx using connector
   * @return {Promise<TransactionHash>}
   */
  async signAndSubmit(): Promise<TransactionHash> {
    return this.sign().then((signedTx) => signedTx.submit());
  }
}
