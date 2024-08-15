import { PlutusData } from '@dcspark/cardano-multiplatform-lib-browser';

import { Dictionary } from '../../../../build';
import {
  CborHexString,
  HexString,
  OutputReference,
} from '../../types/types.ts';
import { MAX_TRANSACTION_FEE } from '../../utils/transactionFee/transactionFee.ts';
import { Currency } from '../currency/Currency.ts';
import { Output } from '../output/Output.ts';
import { UTxO } from '../utxo/UTxO.ts';

export interface InputExtra {
  readonly redeemer: PlutusData;
  readonly scriptRef: OutputReference;
  readonly script: HexString;
  readonly plutusV2ScriptCbor: CborHexString;
  readonly data?: PlutusData;
  readonly requiredSigners: HexString[];
  readonly exUnits: {
    readonly mem: bigint;
    readonly steps: bigint;
  };
}

export interface InternalInputDescriptor {
  readonly uTxO: UTxO;
  readonly extra: undefined;
}

export interface ExternalInputDescriptor {
  readonly uTxO: UTxO;
  readonly extra: InputExtra;
}

export interface MintDescriptor {
  readonly plutusV2ScriptCbor: CborHexString;
  readonly currency: Currency;
  readonly redeemer: PlutusData;
  readonly cip25?: {
    readonly name: string;
    readonly description: string;
    readonly image: string;
    readonly ticker?: string;
  };
  readonly exUnits: {
    readonly mem: bigint;
    readonly steps: bigint;
  };
}

export interface WithdrawDescriptor {
  readonly plutusV2ScriptCbor: CborHexString;
  readonly amount: bigint;
  readonly rewardAddress: string;
  readonly redeemer: PlutusData;
  readonly exUnits: {
    readonly mem: bigint;
    readonly steps: bigint;
  };
}

export type InputDescriptor = InternalInputDescriptor | ExternalInputDescriptor;

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
   * Transaction additional data.
   */
  readonly additionalData: Dictionary<any> = {};

  /**
   * Transaction required signers (pkh)
   * @type {string[]}
   */
  readonly requiredSigners: HexString[] = [];

  /**
   * Current candidate mints
   * @type {MintDescriptor[]}
   */
  readonly mints: MintDescriptor[] = [];

  /**
   * Current candidate withdrawals
   * @type {WithdrawDescriptor[]}
   */
  readonly withdrawals: WithdrawDescriptor[] = [];

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
   * Returns max possible tx fee. TODO: REWRITE
   */
  get maxTxFee(): Currency {
    return this.mints.length || this.withdrawals.length
      ? MAX_TRANSACTION_FEE.multiply(3n)
      : MAX_TRANSACTION_FEE;
  }

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

  addMint(mintDescriptor: MintDescriptor): TransactionCandidate {
    this.mints.push(mintDescriptor);

    return this;
  }

  addWithdrawal(
    withdrawalDescriptor: WithdrawDescriptor,
  ): TransactionCandidate {
    this.withdrawals.push(withdrawalDescriptor);

    return this;
  }

  addRequiredSigners(signers: HexString[]): TransactionCandidate {
    this.requiredSigners.push(...signers);

    return this;
  }

  addAdditionalData(key: string, value: any): TransactionCandidate {
    this.additionalData[key] = value;

    return this;
  }

  private constructor() {}
}
