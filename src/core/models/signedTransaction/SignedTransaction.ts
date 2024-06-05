import {
  SignedTxBuilder,
  Transaction as WasmTransaction,
  TransactionWitnessSet,
  TransactionWitnessSetBuilder,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Splash } from '../../../splash/splash.ts';
import { CborHexString, TransactionHash } from '../../types/types.ts';
import { Transaction } from '../transaction/Transaction.ts';

export interface SignedTransactionConfig {
  readonly transaction: Transaction;
  readonly witnessSetsWithSign: CborHexString[] | TransactionWitnessSet[];
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
  }: SignedTransactionConfig): SignedTransaction {
    const normalizedWitnessSetsWithSign =
      witnessSetsWithSign[0] instanceof TransactionWitnessSet
        ? (witnessSetsWithSign as TransactionWitnessSet[])
        : witnessSetsWithSign.map((item) =>
            TransactionWitnessSet.from_cbor_hex(item),
          );

    return new SignedTransaction(transaction, normalizedWitnessSetsWithSign);
  }

  /**
   * Has only partial sign flag
   * @type {boolean}
   */
  readonly partialSign?: boolean;

  /**
   * Splash client instance
   * @type {Splash<{}>}
   */
  readonly splash: Splash<{}>;

  readonly wasm: WasmTransaction;

  private constructor(
    transaction: Transaction,
    witnessSetWithSign: TransactionWitnessSet[],
  ) {
    this.splash = transaction.splash;
    this.wasm = this.buildSignedWasmTransaction(
      transaction,
      witnessSetWithSign,
    );
    this.partialSign = transaction.partialSign;
  }

  /**
   * Submit current tx using connect
   * @return {Promise<TransactionHash>}
   */
  submit(): Promise<TransactionHash> {
    return this.splash.api.submit(this);
  }

  private buildSignedWasmTransaction(
    transaction: Transaction,
    witnessSetsWithSign: TransactionWitnessSet[],
  ): WasmTransaction {
    const oldWitnessesBuilder = transaction.wasm.witness_set();
    const newWitnessSetBuilder = TransactionWitnessSetBuilder.new();

    newWitnessSetBuilder.add_required_wits(
      oldWitnessesBuilder.remaining_wits(),
    );
    newWitnessSetBuilder.add_existing(oldWitnessesBuilder.build());
    witnessSetsWithSign.forEach((witnessSetWithSign) => {
      newWitnessSetBuilder.add_existing(witnessSetWithSign);
    });

    return SignedTxBuilder.new_without_data(
      transaction.wasm.body(),
      newWitnessSetBuilder,
      transaction.wasm.is_valid(),
    ).build_checked();
  }
}
