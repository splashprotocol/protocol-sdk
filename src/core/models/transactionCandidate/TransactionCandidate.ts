import { PlutusData } from '@dcspark/cardano-multiplatform-lib-browser';

import { OutputReference } from '../../types/types.ts';
import { Output } from '../output/Output.ts';
import { UTxO } from '../utxo/UTxO.ts';

export interface InputExtra {
  readonly redeemer: PlutusData;
  readonly scriptRef: OutputReference;
}

export interface InputDescriptor {
  readonly uTxO: UTxO;
  readonly extra?: InputExtra;
}

/**
 * Transaction Candidate representation
 */
export class TransactionCandidate {
  /**
   * Returns instance of Transaction Candidate
   * @return {TransactionCandidate}
   */
  static new(): TransactionCandidate {
    return new TransactionCandidate();
  }

  /**
   * Current candidate uTxOs
   * @type {UTxO[]}
   */
  readonly inputs: InputDescriptor[] = [];

  /**
   * Current candidate outputs
   * @type {UTxO[]}
   */
  readonly outputs: Output[] = [];

  /**
   * Adds new output to candidate
   * @param {Output} output
   */
  addOutput(output: Output): TransactionCandidate {
    this.outputs.push(output);

    return this;
  }

  /**
   * Adds new input to candidate
   * @param {UTxO} uTxO
   * @param {InputExtra} extra
   */
  addInput(uTxO: UTxO, extra?: InputExtra): TransactionCandidate {
    this.inputs.push({
      uTxO,
      extra,
    });

    return this;
  }

  private constructor() {}
}
