import {
  CborHexString,
  Dictionary,
  TransactionHash,
} from '@splashprotocol/core';
import { BuilderLegacy } from '../../BuilderLegacy.ts';
import { BasicApi } from '@splashprotocol/api';
import { Builder } from '../../Builder.ts';
import { SignedTransaction } from '../SignedTransaction/SignedTransaction.ts';
import { InferPromise } from '../../types/InferPromise.ts';
import { CML } from '../../utils/Cml/Cml.ts';
import type {
  SignedTxBuilder,
  Transaction as WasmTransaction,
} from '@dcspark/cardano-multiplatform-lib-browser';
import { OperationContext } from '../../types/Operation.ts';

export interface TransactionConfig {
  readonly C: InferPromise<typeof CML>;
  readonly signedTxBuilder: SignedTxBuilder;
  readonly partialSign?: boolean;
  readonly additionalData?: Dictionary<any>;
  readonly remoteCollateral: boolean;
  readonly context: OperationContext<any>;
}

/**
 * Transaction representation
 */
export class Transaction {
  /**
   * Creates new instance of Transaction from WasmTransaction | TransactionCbor
   * @param {TransactionConfig} config
   * @param {BuilderLegacy<BasicApi, undefined> | Builder<BasicApi, any>} builder
   * @return {Transaction}
   */
  static new(
    config: TransactionConfig,
    builder: BuilderLegacy<any, undefined> | Builder<any, any>,
  ) {
    return new Transaction(config, builder);
  }

  readonly additionalData?: Dictionary<any>;

  /**
   * Request only partial sign flag
   * @type {boolean}
   */
  readonly partialSign?: boolean;

  /**
   * Tx has remote collateral
   */
  readonly remoteCollateral: boolean;

  /**
   * Tx operation context
   */
  readonly context: OperationContext<any>;

  /**
   * Splash client. Producer of transaction
   * @type {BuilderLegacy<BasicApi, undefined> | Builder<BasicApi, any>}
   */
  readonly builder: BuilderLegacy<BasicApi, undefined> | Builder<BasicApi, any>;

  /**
   * Returns transaction cbor representation
   * @returns {string}
   */
  get cbor(): CborHexString {
    return this.wasm.to_cbor_hex();
  }

  /**
   * Returns wasm representation of transaction
   * @returns {WasmTransaction}
   */
  get wasm(): WasmTransaction {
    return this.signedTxBuilder.build_unchecked();
  }

  /**
   * Returns signedTxBuilder. Always returns new clone of signed tx builder
   * @returns {SignedTxBuilder}
   */
  get signedTxBuilder(): SignedTxBuilder {
    const metadata = this._signedTxBuilder.auxiliary_data();

    if (metadata) {
      return this.C.SignedTxBuilder.new_with_data(
        this.C.TransactionBody.from_cbor_hex(
          this._signedTxBuilder.body().to_cbor_hex(),
        ),
        this._signedTxBuilder.witness_set(),
        this._signedTxBuilder.is_valid(),
        this.C.AuxiliaryData.from_cbor_hex(metadata.to_cbor_hex()),
      );
    }
    return this.C.SignedTxBuilder.new_without_data(
      this.C.TransactionBody.from_cbor_hex(
        this._signedTxBuilder.body().to_cbor_hex(),
      ),
      this._signedTxBuilder.witness_set(),
      this._signedTxBuilder.is_valid(),
    );
  }

  readonly _signedTxBuilder: SignedTxBuilder;

  readonly C: InferPromise<typeof CML>;

  private constructor(
    {
      signedTxBuilder,
      partialSign,
      additionalData,
      remoteCollateral,
      C,
      context,
    }: TransactionConfig,
    builder: BuilderLegacy<BasicApi, undefined> | Builder<BasicApi, any>,
  ) {
    this.partialSign = partialSign;
    this.builder = builder;
    this.remoteCollateral = remoteCollateral;
    this.additionalData = additionalData;
    this._signedTxBuilder = signedTxBuilder;
    this.context = context;
    this.C = C;
  }

  /**
   * Sign current tx using connector
   * @return {Promise<SignedTransaction>}
   */
  async sign(): Promise<SignedTransaction> {
    return this.builder.sign(this);
  }

  /**
   * Sign and submit current tx using connector
   * @return {Promise<TransactionHash>}
   */
  async signAndSubmit(): Promise<TransactionHash> {
    return this.sign().then((signedTx) => signedTx.submit());
  }
}
