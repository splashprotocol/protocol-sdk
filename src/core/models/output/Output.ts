import {
  Address,
  DatumOption,
  min_ada_required,
  PlutusData,
  TransactionOutput,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { ProtocolParams } from '../../types/ProtocolParams.ts';
import { Bech32String, CborHexString } from '../../types/types.ts';
import { Currencies } from '../currencies/Currencies.ts';
import { Currency } from '../currency/Currency.ts';

const INSUFFICIENT_BYTES = 2;

/**
 * It creates wasm transaction output representation
 * @param {Bech32String} address
 * @param {Currencies} currencies
 * @param {Datum<any>} data
 * @returns {TransactionOutput}
 */
export const toWasmOutput = (
  address: Bech32String,
  currencies: Currencies,
  data?: PlutusData,
): TransactionOutput => {
  let wasmAddress: Address;
  try {
    wasmAddress = Address.from_bech32(address);
  } catch (e) {
    throw new Error(`Invalid address format. ${address} isn't bech32`);
  }
  const wasmValue = currencies.toWasmValue();

  if (data) {
    return TransactionOutput.new(
      wasmAddress,
      wasmValue,
      DatumOption.new_datum(data),
    );
  } else {
    return TransactionOutput.new(wasmAddress, wasmValue);
  }
};

export interface OutputParams {
  readonly address: Bech32String;
  readonly value: Currencies | Currency[];
  readonly data?: PlutusData;
}

/**
 * Representation on transaction output
 */
export class Output {
  static new(pParams: ProtocolParams, params: OutputParams): Output {
    return new Output(pParams.coinsPerUtxoByte, pParams.minUTxOValue, params);
  }

  /**
   * Wasm representation of output
   * @type {TransactionOutput}
   */
  public wasm: TransactionOutput;

  /**
   * Currencies that includes additional ada
   * @type {Currencies}
   */
  public totalValue: Currencies;

  /**
   * Min required ada for output.
   * @type {Currency}
   */
  public minAdaRequired: Currency;

  /**
   * user Currencies
   * @type {Currencies}
   */
  public userValue: Currencies;

  /**
   * Output datum
   * @type {PlutusData}
   */
  public data: PlutusData | undefined;

  /**
   * Output address
   * @type {Bech32String}
   */
  public address: Bech32String;

  /**
   * It returns true if user funds cover min uTxO ada value
   * @type {boolean}
   */
  public isUserValueCoverMinAdaRequired: boolean;

  /**
   * Additional ada needed to add to user funds to cover min uTxO value
   * @type {Currency}
   */
  public additionalAdaToCoverMinAdaRequired: Currency;

  private constructor(
    coinsPerUtxoByte: bigint,
    minUtxoValue: bigint,
    { value, address, data }: OutputParams,
  ) {
    const normalizedCurrencies: Currencies =
      value instanceof Currencies ? value : Currencies.new(value || []);
    const outputExceptMinAdaRequired = toWasmOutput(
      address,
      normalizedCurrencies,
      data,
    );

    let minAdaRequiredAmount =
      BigInt(
        min_ada_required(
          outputExceptMinAdaRequired,
          coinsPerUtxoByte,
        ).toString(),
      ) + BigInt(Number(coinsPerUtxoByte) * INSUFFICIENT_BYTES);
    minAdaRequiredAmount =
      minAdaRequiredAmount >= minUtxoValue
        ? minAdaRequiredAmount
        : minUtxoValue;

    const minAdaRequired = Currency.ada(minAdaRequiredAmount);
    const userAda = normalizedCurrencies.ada || Currency.ada(0n);

    this.minAdaRequired = minAdaRequired;
    this.address = address;
    this.userValue = normalizedCurrencies;
    this.data = data;

    if (userAda.gte(minAdaRequired)) {
      this.wasm = outputExceptMinAdaRequired;
      this.totalValue = normalizedCurrencies;
      this.isUserValueCoverMinAdaRequired = true;
      this.additionalAdaToCoverMinAdaRequired = Currency.ada(0n);
    } else {
      const additionalAda = minAdaRequired.minus(userAda);
      const totalCurrencies = normalizedCurrencies.plus(
        Currencies.new([additionalAda]),
      );
      this.wasm = toWasmOutput(address, totalCurrencies, data);
      this.totalValue = totalCurrencies;
      this.isUserValueCoverMinAdaRequired = false;
      this.additionalAdaToCoverMinAdaRequired = additionalAda;
    }
  }

  get cborHex(): CborHexString {
    return this.wasm.to_cbor_hex();
  }
}
