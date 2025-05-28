import {
  CborHexString,
  Currency,
  Dictionary,
  HexString,
  OutputReference,
  uint,
} from '@splashprotocol/core';
import { UTxO } from '../UTxO/UTxO.ts';
import { Output } from '../Output/Output.ts';

export interface InputExtraBase {
  readonly redeemer?: CborHexString | ((index: uint) => CborHexString);
  readonly data?: CborHexString;
  readonly requiredSigners?: HexString[];
  readonly exUnits?: {
    readonly mem: bigint;
    readonly steps: bigint;
  };
}

export interface ScriptReferenceInputExtra extends InputExtraBase {
  readonly script: CborHexString;
}

export interface ScriptHashReferenceInputExtra extends InputExtraBase {
  readonly scriptHash: CborHexString;
  readonly uTxORef: OutputReference;
}

export interface BaseMintDescriptor {
  readonly asset: Currency;
  readonly redeemer?: CborHexString;
  readonly cip25?: {
    readonly name: string;
    readonly description: string;
    readonly image: string;
    readonly poolAuthor: string;
    readonly ticker?: string;
    readonly socials?: {
      readonly website?: string;
      readonly twitter?: string;
      readonly telegram?: string;
      readonly discord?: string;
    };
  };
  readonly exUnits?: {
    readonly mem: bigint;
    readonly steps: bigint;
  };
}

export interface ScriptMintDescriptor extends BaseMintDescriptor {
  readonly script: CborHexString;
  readonly type?: 'plutusV2' | 'plutusV3';
}

export interface ScriptHashMintDescriptor extends BaseMintDescriptor {
  readonly scriptHash: HexString;
  readonly uTxORef: OutputReference;
}

export interface InputDescriptor {
  readonly uTxO: UTxO;
  readonly extra?: ScriptReferenceInputExtra | ScriptHashReferenceInputExtra;
}

export interface MetadataPart {
  readonly label: bigint;
  readonly data: bigint | string | Dictionary<MetadataPart> | MetadataPart[];
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

  readonly metadata: MetadataPart[] = [];

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
   * @type {BaseMintDescriptor[]}
   */
  readonly mints: (ScriptMintDescriptor | ScriptHashMintDescriptor)[] = [];

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
   * valid from slot
   */
  validFrom: bigint | undefined = undefined;

  /**
   * valid to slot
   */
  validTo: bigint | undefined = undefined;

  /**
   * Adds new output to candidate
   * @param {Output} output
   */
  addOutput(output: Output): TransactionCandidate {
    this.outputs.push(output);

    return this;
  }

  setRangeStart(validFrom: bigint) {
    this.validFrom = validFrom;
  }

  setRangeEnd(validTo: bigint) {
    this.validTo = validTo;
  }

  /**
   * Adds new input to candidate
   * @param {UTxO} uTxO
   * @param {InputExtraBase} extra
   */
  addInput(
    uTxO: UTxO,
    extra?: ScriptReferenceInputExtra | ScriptHashReferenceInputExtra,
  ): TransactionCandidate {
    this.inputs.push({
      uTxO,
      extra,
    });

    return this;
  }

  addMint(
    mintDescriptor: ScriptMintDescriptor | ScriptHashMintDescriptor,
  ): TransactionCandidate {
    this.mints.push(mintDescriptor);

    return this;
  }

  addMetadata(metadataItem: MetadataPart): TransactionCandidate {
    this.metadata.push(metadataItem);

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
