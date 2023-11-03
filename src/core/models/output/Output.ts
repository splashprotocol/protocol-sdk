import {
  Address,
  BigNum,
  DataCost,
  min_ada_for_output,
  TransactionOutput,
} from '@emurgo/cardano-serialization-lib-browser';

import { getProtocolParams } from '../../../init.ts';
import { Bech32String, CborHexString } from '../../types/types.ts';
import { AssetAmount } from '../assetAmount/AssetAmount.ts';
import { AssetAmountSet } from '../assetAmountSet/AssetAmountSet.ts';
import { Datum } from '../datum/DatumConstructor.ts';

const INSUFFICIENT_BYTES = 2;

/**
 * It creates wasm transaction output representation
 * @param {Bech32String} address
 * @param {AssetAmountSet} assetAmountSet
 * @param {Datum<any>} datum
 * @returns {TransactionOutput}
 */
export const toWasmOutput = (
  address: Bech32String,
  assetAmountSet: AssetAmountSet,
  datum?: Datum<any>,
): TransactionOutput => {
  let wasmAddress: Address;
  try {
    wasmAddress = Address.from_bech32(address);
  } catch (e) {
    throw new Error(`Invalid address format. ${address} isn't bech32`);
  }
  const wasmValue = assetAmountSet.toWasmValue();

  const transactionOutput = TransactionOutput.new(wasmAddress, wasmValue);
  if (datum) {
    transactionOutput.set_plutus_data(datum.wasm);
  }

  return transactionOutput;
};

/**
 * Representation on transaction output
 */
export class Output<D extends Datum<any> | undefined> {
  /**
   * Creates output without datum
   * @param {Bech32String} address
   * @param {AssetAmountSet} userAssetAmountSet
   * @returns {Output<undefined>}
   */
  static async createWithoutDatum(
    address: Bech32String,
    userAssetAmountSet: AssetAmountSet,
  ): Promise<Output<undefined>> {
    return getProtocolParams().then(
      ({ coinsPerUtxoByte, minUTxOValue }) =>
        new Output(
          coinsPerUtxoByte,
          minUTxOValue,
          address,
          userAssetAmountSet,
          undefined,
        ),
    );
  }

  /**
   * Creates output with datum
   * @param {Bech32String} address
   * @param {AssetAmountSet} userAssetAmountSet
   * @param {D} datum
   * @returns {Output<D>}
   */
  static async createWithDatum<D extends Datum<any>>(
    address: Bech32String,
    userAssetAmountSet: AssetAmountSet,
    datum: D,
  ): Promise<Output<D>> {
    return getProtocolParams().then(
      ({ coinsPerUtxoByte, minUTxOValue }) =>
        new Output(
          coinsPerUtxoByte,
          minUTxOValue,
          address,
          userAssetAmountSet,
          datum,
        ),
    );
  }

  /**
   * Wasm representation of output
   * @type {TransactionOutput}
   */
  public wasm: TransactionOutput;

  /**
   * AssetAmountSet that includes min required ada
   * @type {AssetAmountSet}
   */
  public totalAssetAmountSet: AssetAmountSet;

  /**
   * Min required ada for output
   * @type {AssetAmount}
   */
  public minAdaRequired: AssetAmount;

  private constructor(
    coinsPerUtxoByte: bigint,
    minUtxoValue: bigint,
    public readonly address: Bech32String,
    public readonly userAssetAmountSet: AssetAmountSet,
    public readonly datum: D,
  ) {
    const outputExceptMinAdaRequired = toWasmOutput(
      address,
      userAssetAmountSet,
      datum,
    );
    const dataCost = DataCost.new_coins_per_byte(
      BigNum.from_str(coinsPerUtxoByte.toString()),
    );
    const minAdaRequiredAmount =
      BigInt(
        min_ada_for_output(outputExceptMinAdaRequired, dataCost).to_str(),
      ) + BigInt(Number(coinsPerUtxoByte) * INSUFFICIENT_BYTES);

    const minAdaRequired = AssetAmount.adaAssetAmount(minAdaRequiredAmount);
    const userAda =
      userAssetAmountSet.getAda() || AssetAmount.adaAssetAmount(0n);

    this.minAdaRequired = minAdaRequired;
    if (userAda.gte(minAdaRequired)) {
      this.wasm = outputExceptMinAdaRequired;
      this.totalAssetAmountSet = userAssetAmountSet;
    } else {
      const additionalAda = minAdaRequired.minus(userAda);
      const totalAssetAmountSet = userAssetAmountSet.plus(
        AssetAmountSet.fromAssetAmountArray([additionalAda]),
      );
      this.wasm = toWasmOutput(address, totalAssetAmountSet, datum);
      this.totalAssetAmountSet = totalAssetAmountSet;
    }

    if (this.totalAssetAmountSet.getAda()?.lt(minUtxoValue)) {
      throw new Error(
        `Utxo is too small. Minimum ada value in utxo is ${minUtxoValue}`,
      );
    }
  }

  get cborHex(): CborHexString {
    return this.wasm.to_hex();
  }
}
