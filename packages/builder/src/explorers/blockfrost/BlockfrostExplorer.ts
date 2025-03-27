import {
  AssetInfo,
  Bech32String,
  CborHexString,
  Currencies,
  Currency,
  Network,
  OutputReference,
  TransactionHash,
} from '@splashprotocol/core';
import { UTxO } from '../../core/models/UTxO/UTxO.ts';
import { BuilderExplorer } from '../../core/types/BuilderExplorer.ts';
import { NetworkContext } from '../../core/types/NetworkContext.ts';
import { ProtocolParams } from '../../core/types/ProtocolParams.ts';
import { CML } from '../../core/utils/Cml/Cml.ts';
import { toWasmValue } from '../../core/models/Output/Output.ts';

export class BlockfrostExplorer implements BuilderExplorer {
  static new(network: Network, projectId: string): BlockfrostExplorer {
    return new BlockfrostExplorer(network, projectId);
  }

  /**
   * Network type
   * @type {Network}
   */
  readonly network: Network;

  private blockFrostApi: any;

  constructor(
    network: Network,
    public projectId: string,
  ) {
    this.network = network;
    // this.blockFrostApi = new BlockFrostAPI({
    //   network: network,
    //   projectId: projectId,
    // });
  }

  getProtocolParams(): Promise<ProtocolParams> {
    return this.blockFrostApi.epochsLatestParameters().then((params) => ({
      txFeePerByte: BigInt(params.min_fee_a),
      txFeeFixed: BigInt(params.min_fee_b),
      collateralPercentage: params.collateral_percent!,
      maxCollateralInputs: params.max_collateral_inputs!,
      maxTxExecutionUnits: {
        steps: BigInt(params.max_tx_ex_steps!),
        memory: BigInt(params.max_tx_ex_mem!),
      },
      costModels: {} as any,
      maxTxSize: params.max_tx_size,
      maxValueSize: Number(params.max_val_size!),
      coinsPerUtxoByte: BigInt(params.coins_per_utxo_size!),
      poolDeposit: BigInt(params.pool_deposit),
      protocolVersion: {
        major: params.protocol_major_ver,
        minor: params.protocol_minor_ver,
      },
      executionUnitPrices: {
        priceSteps: Number(params.price_step!),
        priceMemory: Number(params.price_mem!),
      },
      keyDeposit: BigInt(params.key_deposit),
      network: this.network,
      minUTxOValue: BigInt(params.min_utxo),
    }));
  }

  getNetworkContext(): Promise<NetworkContext> {
    return this.blockFrostApi.blocksLatest().then((block) => ({
      blockHash: block.hash,
      blockId: block.height!,
      blockNo: block.height!,
      epochNo: block.epoch!,
      slotNo: block.slot!,
      slotLeader: block.slot_leader!,
      txCount: block.tx_count!,
      time: new Date(block.time * 1_000).toString(),
    }));
  }

  async getUTxOByRef(
    ref: OutputReference, // ref: OutputReference | OutputReferenceHash,
  ): Promise<UTxO | undefined> {
    return this.blockFrostApi.txsUtxos(ref.txHash).then(async (data) => {
      if (!data?.inputs[Number(ref.index)]) {
        return undefined;
      }

      const rawUTxO = data?.outputs[Number(ref.index)];

      const C = await CML;

      const currencies = Currencies.new(
        rawUTxO.amount.map((item) => {
          if (item.unit === 'lovelace') {
            return Currency.ada(BigInt(item.quantity));
          } else {
            return Currency.new(
              BigInt(item.quantity),
              AssetInfo.fromSubject(item.unit),
            );
          }
        }),
      );

      const wasmInput = C.TransactionInput.new(
        C.TransactionHash.from_hex(data.hash),
        BigInt(rawUTxO.output_index),
      );
      const wasmOutput = C.TransactionOutput.new(
        C.Address.from_bech32(rawUTxO.address),
        toWasmValue(C, currencies),
        rawUTxO.inline_datum
          ? C.DatumOption.new_datum(
              C.PlutusData.from_cbor_hex(rawUTxO.inline_datum),
            )
          : undefined,
      );

      const wasmUTxO = C.TransactionUnspentOutput.new(wasmInput, wasmOutput);

      return UTxO.new({
        cbor: wasmUTxO.to_cbor_hex(),
        spent: !!rawUTxO.consumed_by_tx,
      });
    });
  }

  async getUTxOsByAddress(address: Bech32String): Promise<UTxO[]> {
    const C = await CML;

    return this.blockFrostApi.addressesUtxosAll(address).then((uTxOs) => {
      return Promise.all(
        uTxOs.map((uTxoDescriptor) => {
          const currencies = Currencies.new(
            uTxoDescriptor.amount.map((item) => {
              if (item.unit === 'lovelace') {
                return Currency.ada(BigInt(item.quantity));
              } else {
                return Currency.new(
                  BigInt(item.quantity),
                  AssetInfo.fromSubject(item.unit),
                );
              }
            }),
          );

          const wasmInput = C.TransactionInput.new(
            C.TransactionHash.from_hex(uTxoDescriptor.tx_hash),
            BigInt(uTxoDescriptor.output_index),
          );
          const wasmOutput = C.TransactionOutput.new(
            C.Address.from_bech32(uTxoDescriptor.address),
            toWasmValue(C, currencies),
            uTxoDescriptor.inline_datum
              ? C.DatumOption.new_datum(
                  C.PlutusData.from_cbor_hex(uTxoDescriptor.inline_datum),
                )
              : undefined,
          );
          const wasmUTxO = C.TransactionUnspentOutput.new(
            wasmInput,
            wasmOutput,
          );

          return UTxO.new({
            cbor: wasmUTxO.to_cbor_hex(),
            spent: false,
          });
        }),
      );
    });
  }

  submitTx(signedTxCbor: CborHexString): Promise<TransactionHash> {
    return this.blockFrostApi.txSubmit(signedTxCbor);
  }

  evaluateTx(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
