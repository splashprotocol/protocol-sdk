import {
  PlutusData,
  TransactionHash,
  TransactionInput,
  TransactionUnspentOutput,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import { RawUTxO } from '../../../../core/api/types/common/RawUTxO.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Output } from '../../../../core/models/output/Output.ts';
import { UTxO } from '../../../../core/models/utxo/UTxO.ts';
import { ProtocolParams } from '../../../../core/types/ProtocolParams.ts';
import { Dictionary } from '../../../../core/types/types.ts';

export interface MapRawUTxOToUTxOConfig {
  readonly pParams: ProtocolParams;
  readonly rawUTxO?: RawUTxO;
  readonly metadata?: Dictionary<AssetMetadata>;
}

export const mapRawUTxOToUTxO = ({
  rawUTxO,
  pParams,
  metadata,
}: MapRawUTxOToUTxOConfig): UTxO | undefined => {
  if (!rawUTxO) {
    return undefined;
  }
  const currencies = Currencies.new(
    rawUTxO.value.map(
      (item) =>
        Currency.new(
          BigInt(item.jsQuantity),
          AssetInfo.new({
            name: item.name,
            type: 'base16',
            policyId: item.policyId,
          }),
        ),
      metadata,
    ),
  );
  // TODO: optimize UTxO constructor. REWRITE UTxO structure
  const output = Output.new(pParams, {
    address: rawUTxO.addr,
    value: currencies,
    data: rawUTxO.dataBin
      ? PlutusData.from_cbor_hex(rawUTxO.dataBin)
      : undefined,
  });
  const wasmInput = TransactionInput.new(
    TransactionHash.from_hex(rawUTxO.txHash),
    BigInt(rawUTxO.index),
  );

  return UTxO.new(
    TransactionUnspentOutput.new(wasmInput, output.wasm),
    metadata,
    !!rawUTxO.spentByTxHash,
  );
};
