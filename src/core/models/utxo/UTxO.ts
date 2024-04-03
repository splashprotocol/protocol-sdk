import {
  TransactionInput,
  TransactionOutput,
  TransactionUnspentOutput,
} from '@dcspark/cardano-multiplatform-lib-browser';

import {
  Bech32String,
  CborHexString,
  OutputReference,
  OutputReferenceHash,
  TransactionHash,
} from '../../types/types.ts';
import { Currencies } from '../currencies/Currencies.ts';

const DEFAULT_OUTPUT_START = 35;

const getWasmInputOutputPair = (
  wasmUTxO: TransactionUnspentOutput,
): [TransactionInput, TransactionOutput] => {
  const bytes = wasmUTxO.to_cbor_bytes();

  let output: TransactionOutput | undefined = undefined;
  let input: TransactionInput | undefined = undefined;

  let outputByteStart = DEFAULT_OUTPUT_START;
  let outputBytes = bytes.slice(outputByteStart, bytes.length);
  while (outputBytes.length > 0 && !output) {
    try {
      output = TransactionOutput.from_cbor_bytes(outputBytes);
    } catch {
      outputBytes = outputBytes.subarray(1, outputBytes.length);
      outputByteStart++;
    }
  }

  let inputByteStart = 0;
  let inputBytes = bytes.slice(inputByteStart, outputByteStart);
  while (inputBytes.length > 0 && !input) {
    try {
      input = TransactionInput.from_cbor_bytes(inputBytes);
    } catch {
      inputBytes = inputBytes.subarray(1, inputBytes.length);
      inputByteStart++;
    }
  }

  if (!output || !input) {
    throw new Error(`UTxO parsing error. Cbor: ${wasmUTxO.to_cbor_hex()}`);
  }

  return [input, output];
};

export type UTxOConfig = CborHexString | TransactionUnspentOutput;

/**
 * UTxO sdk representation
 */
export class UTxO {
  /**
   * Creates new Utxo with specified config
   * @param {UTxOConfig} config
   * @return {UTxO}
   */
  static new(config: UTxOConfig): UTxO {
    if (config instanceof TransactionUnspentOutput) {
      return new UTxO(config);
    }
    return new UTxO(TransactionUnspentOutput.from_cbor_hex(config));
  }

  /**
   * UTxO address
   * @type {Bech32String}
   */
  readonly address: Bech32String;

  /**
   * UTxO currencies
   * @type {Currencies}
   */
  readonly value: Currencies;

  /**
   * UTxO txHash
   * @type {Currencies}
   */
  readonly txHash: TransactionHash;

  /**
   * UTxO index
   * @type {Currencies}
   */
  readonly index: bigint;

  /**
   * UTxo ref hash in format txHash#index
   * @type {string}
   */
  readonly refHash: OutputReferenceHash;

  /**
   * UTxo ref hash in format txHash#index
   * @type {string}
   */
  readonly ref: OutputReference;

  /**
   * Wasm representation of UTxo
   * @type {TransactionUnspentOutput}
   */
  readonly wasm: TransactionUnspentOutput;

  /**
   * Wasm representation of Input
   * @type {TransactionUnspentOutput}
   */
  readonly wasmInput: TransactionInput;

  /**
   * Wasm representation of Output
   * @type {TransactionUnspentOutput}
   */
  readonly wasmOutput: TransactionOutput;

  private constructor(wasm: TransactionUnspentOutput) {
    const [input, output] = getWasmInputOutputPair(wasm);

    this.wasm = wasm;
    this.wasmInput = input;
    this.wasmOutput = output;
    this.txHash = this.wasmInput.transaction_id().to_hex();
    this.index = this.wasmInput.index();
    this.refHash = `${this.txHash}#${this.index}`;
    this.ref = {
      txHash: this.txHash,
      index: this.index,
    };
    this.value = Currencies.new(this.wasmOutput.amount());
    this.address = this.wasmOutput.address().to_bech32();
  }
}
