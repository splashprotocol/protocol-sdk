import { getTxId, Transaction } from '../Transaction/Transaction.ts';
import { CborHexString, TransactionHash } from '@splashprotocol/core';
import { InferPromise } from '../../types/InferPromise.ts';
import { CML } from '../../utils/Cml/Cml.ts';
import type {
  TransactionWitnessSet,
  Transaction as WasmTransaction,
} from '@dcspark/cardano-multiplatform-lib-browser';
import { BuilderLegacy } from '../../BuilderLegacy.ts';
import { BasicApi } from '@splashprotocol/api';
import { Builder } from '../../Builder.ts';

export const applyWitnessToTransaction = (
  C: InferPromise<typeof CML>,
  cbor: CborHexString,
  witnesses: CborHexString[],
): WasmTransaction => {
  const unsignedWasmTransaction = C.Transaction.from_cbor_hex(cbor);
  const newWitnessSetBuilder = C.TransactionWitnessSetBuilder.new();
  newWitnessSetBuilder.add_existing(unsignedWasmTransaction.witness_set());
  witnesses.forEach((witness) => {
    newWitnessSetBuilder.add_existing(
      C.TransactionWitnessSet.from_cbor_hex(witness),
    );
  });

  const tx = unsignedWasmTransaction.auxiliary_data()
    ? C.SignedTxBuilder.new_with_data(
        unsignedWasmTransaction.body(),
        newWitnessSetBuilder,
        unsignedWasmTransaction.is_valid(),
        unsignedWasmTransaction.auxiliary_data()!,
      ).build_checked()
    : C.SignedTxBuilder.new_without_data(
        unsignedWasmTransaction.body(),
        newWitnessSetBuilder,
        unsignedWasmTransaction.is_valid(),
      ).build_checked();

  return C.Transaction.from_cbor_hex(tx.to_canonical_cbor_hex());
};

export interface SignedTransactionConfig {
  readonly C: InferPromise<typeof CML>;
  readonly transaction: Transaction;
  readonly witnessSetsWithSign: CborHexString[];
}

/**
 * Signed transaction representation
 */
export class SignedTransaction {
  /**
   * Create new signed transaction from config
   * @param {SignedTransactionConfig} config
   * @return {SignedTransaction}
   */
  static new({
    transaction,
    witnessSetsWithSign,
    C,
  }: SignedTransactionConfig): SignedTransaction {
    return new SignedTransaction(
      C,
      transaction,
      witnessSetsWithSign.map((item) =>
        C.TransactionWitnessSet.from_cbor_hex(item),
      ),
    );
  }

  /**
   * Has only partial sign flag
   * @type {boolean}
   */
  readonly partialSign?: boolean;

  /**
   * Splash client instance
   * @type {BuilderLegacy<BasicApi, undefined> | Builder<BasicApi, any>}
   */
  readonly builder: BuilderLegacy<BasicApi, undefined> | Builder<BasicApi, any>;

  /**
   * wasm representation of signed transaction
   * @type {WasmTransaction}
   */
  readonly wasm: WasmTransaction;

  /**
   * cbor of signed transaction
   */
  readonly cbor: CborHexString;

  /**
   * Transaction hash
   */
  readonly id: TransactionHash;

  private C: InferPromise<typeof CML>;

  private constructor(
    C: InferPromise<typeof CML>,
    transaction: Transaction,
    witnessSetWithSign: TransactionWitnessSet[],
  ) {
    this.C = C;
    this.builder = transaction.builder;
    this.wasm = this.buildSignedWasmTransaction(
      transaction,
      witnessSetWithSign,
    );
    this.id = getTxId(this.C, this.wasm);
    this.cbor = this.wasm.to_cbor_hex();
    this.partialSign = transaction.partialSign;
  }

  /**
   * Submit current tx using connect
   * @return {Promise<TransactionHash>}
   */
  submit(): Promise<TransactionHash> {
    return this.builder.submit(this);
  }

  private buildSignedWasmTransaction(
    transaction: Transaction,
    witnessSetsWithSign: TransactionWitnessSet[],
  ): WasmTransaction {
    return applyWitnessToTransaction(
      this.C,
      transaction.cbor,
      witnessSetsWithSign.map((ws) => ws.to_cbor_hex()),
    );
  }
}
