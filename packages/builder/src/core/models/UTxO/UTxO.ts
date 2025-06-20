import {
  AssetInfo,
  Bech32String,
  CborHexString,
  Currencies,
  Currency,
  HexString,
  OutputReference,
  OutputReferenceHash,
  TransactionHash,
} from '@splashprotocol/core';
import { InferPromise } from '../../types/InferPromise.ts';
import { CML } from '../../utils/Cml/Cml.ts';
import type {
  TransactionUnspentOutput,
  TransactionInput,
  TransactionOutput,
} from '@dcspark/cardano-multiplatform-lib-browser';
import { toWasmValue } from '../Output/Output.ts';

export interface UTxOCborConfig {
  readonly cbor: CborHexString;
  readonly spent?: boolean;
}

export interface UTxODataConfig {
  readonly transactionHash: HexString;
  readonly index: bigint | string;
  readonly address: Bech32String;
  readonly value: {
    readonly policyId: HexString;
    readonly base16Name: HexString;
    readonly amount: bigint | string;
  }[];
  readonly spent?: boolean;
}

export type UTxOConfig = UTxOCborConfig | UTxODataConfig;

const isUTxOCborConfig = (config: UTxOConfig): config is UTxOCborConfig => {
  return !!(config as unknown as UTxOCborConfig).cbor;
};

/**
 * UTxO sdk representation
 */
export class UTxO {
  /**
   * Creates new UTxo with specified config and CML
   * @param {UTxOConfig} config
   * @param {InferPromise<typeof CML>} C
   * @return {UTxO}
   */
  static newSync(config: UTxOConfig, C: InferPromise<typeof CML>): UTxO {
    return new UTxO(config, C);
  }

  /**
   * Creates new UTxo with specified config
   * @param {UTxOConfig} config
   * @return {Promise<UTxO>}
   */
  static async new(config: UTxOConfig): Promise<UTxO> {
    return UTxO.newSync(config, await CML);
  }

  // TODO: EXTRACT TO OUTPUT STRUCTURE
  /**
   * Is UTxO spended flag
   * @type {boolean}
   */
  readonly spent: boolean;

  /**
   * Address of UTxO
   * @type {Bech32String}
   */
  readonly address: Bech32String;

  /**
   * Payment credentials of UTxO. Can be pkh or skh
   * @type {HexString}
   */
  readonly paymentCredentials: HexString;

  /**
   * Stake credentials of UTxO.
   * @type {HexString | undefined}
   */
  readonly stakeCredentials?: HexString;

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
   * UTxo cbor string
   */
  readonly cbor: CborHexString;

  private constructor(
    config: UTxOConfig,
    private C: InferPromise<typeof CML>,
  ) {
    if (isUTxOCborConfig(config)) {
      const wasm = C.TransactionUnspentOutput.from_cbor_hex(config.cbor);
      const wasmAddress = wasm.output().address();
      const paymentCredentials = wasmAddress.payment_cred()?.as_pub_key()
        ? wasmAddress.payment_cred()?.as_pub_key()?.to_hex()
        : wasmAddress.payment_cred()?.as_script()?.to_hex();

      this.cbor = config.cbor;
      this.txHash = this.wasmInput.transaction_id().to_hex();
      this.index = this.wasmInput.index();
      this.refHash = `${this.txHash}#${this.index}`;
      this.ref = {
        txHash: this.txHash,
        index: this.index,
      };
      this.value = Currencies.fromCbor(wasm.output().amount().to_cbor_hex());
      this.address = this.wasm.output().address().to_bech32();
      this.paymentCredentials = paymentCredentials!;
      this.spent = config.spent || false;
      this.stakeCredentials = wasmAddress
        .staking_cred()
        ?.as_pub_key()
        ?.to_hex();
    } else {
      const wasmAddress = C.Address.from_bech32(config.address);
      const paymentCredentials = wasmAddress.payment_cred()?.as_pub_key()
        ? wasmAddress.payment_cred()?.as_pub_key()?.to_hex()
        : wasmAddress.payment_cred()?.as_script()?.to_hex();

      this.txHash = config.transactionHash;
      this.index = BigInt(config.index);
      this.refHash = `${this.txHash}#${this.index}`;
      this.ref = {
        txHash: this.txHash,
        index: this.index,
      };
      this.value = Currencies.new(
        config.value.map((item) =>
          Currency.new(
            BigInt(item.amount),
            AssetInfo.fromBase16(item.policyId, item.base16Name),
          ),
        ),
      );
      this.address = config.address;
      this.paymentCredentials = paymentCredentials!;
      this.spent = config.spent || false;
      this.stakeCredentials = wasmAddress
        .staking_cred()
        ?.as_pub_key()
        ?.to_hex();
      this.cbor = C.TransactionUnspentOutput.new(
        C.TransactionInput.new(
          C.TransactionHash.from_hex(config.transactionHash),
          BigInt(config.index),
        ),
        C.TransactionOutput.new(wasmAddress, toWasmValue(C, this.value)),
      ).to_cbor_hex();
    }
  }

  /**
   * Wasm representation of UTxo
   * @type {TransactionUnspentOutput}
   */
  get wasm(): TransactionUnspentOutput {
    return this.C.TransactionUnspentOutput.from_cbor_hex(this.cbor);
  }

  /**
   * Wasm representation of Input
   * @type {TransactionInput}
   */
  get wasmInput(): TransactionInput {
    return this.wasm.input();
  }

  /**
   * Wasm representation of Output
   * @type {TransactionUnspentOutput}
   */
  get wasmOutput(): TransactionOutput {
    return this.wasm.output();
  }
}
