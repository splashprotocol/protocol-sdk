import {
  Address,
  TransactionOutput,
} from '@emurgo/cardano-serialization-lib-browser';

import { AssetAmountSet } from '../../models/assetAmountSet/AssetAmountSet.ts';
import { Datum } from '../../models/datum/DatumConstructor.ts';
import { Bech32String } from '../../types/types.ts';

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
  const wasmAddress = Address.from_bech32(address);
  const wasmValue = assetAmountSet.toWasmValue();

  const transactionOutput = TransactionOutput.new(wasmAddress, wasmValue);
  if (datum) {
    transactionOutput.set_plutus_data(datum.wasm);
  }

  return transactionOutput;
};
