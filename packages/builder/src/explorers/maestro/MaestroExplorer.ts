import { UTxO } from '../../core/models/UTxO/UTxO.ts';
import { BuilderExplorer } from '../../core/types/BuilderExplorer.ts';
import {
  AssetInfo,
  Bech32String,
  CborHexString,
  Currencies,
  Currency,
  math,
  Network,
  OutputReference,
  TransactionHash,
} from '@splashprotocol/core';
import { NetworkContext } from '../../core/types/NetworkContext.ts';
import { ProtocolParams } from '../../core/types/ProtocolParams.ts';
import { RawProtocolParams } from './methods/getProtocolParams/RawProtocolParams.ts';
import { RawNetworkContext } from './methods/getProtocolParams/RawNetworkContext.ts';
import { RawUTxO } from './methods/getProtocolParams/RawUTxO.ts';
import { CML } from '../../core/utils/Cml/Cml.ts';
import { toWasmValue } from '../../core/models/Output/Output.ts';

export class MaestroExplorer implements BuilderExplorer {
  static new(network: Network, apiKey: string) {
    return new MaestroExplorer(network, apiKey);
  }

  private get url() {
    return `https://${this.network}.gomaestro-api.org/v1/`;
  }

  private get auth() {
    return { 'api-key': this.apiKey };
  }

  private constructor(
    public readonly network: Network,
    private apiKey: string,
  ) {}

  async getProtocolParams(): Promise<ProtocolParams> {
    return fetch(`${this.url}protocol-parameters`, {
      headers: this.auth,
    })
      .then((res) => res.json())
      .then((raw: RawProtocolParams): ProtocolParams => {
        const priceMemory = math
          .evaluate(`${raw.data.script_execution_prices.memory}`)
          .toFixed();
        const priceSteps = math
          .evaluate(`${raw.data.script_execution_prices.cpu}`)
          .toFixed();

        return {
          coinsPerUtxoByte: BigInt(raw.data.min_utxo_deposit_coefficient),
          collateralPercentage: raw.data.collateral_percentage,
          costModels: raw.data.plutus_cost_models as any,
          keyDeposit: BigInt(raw.data.stake_credential_deposit.ada.lovelace),
          maxCollateralInputs: raw.data.max_collateral_inputs,
          executionUnitPrices: {
            priceMemory: Number(priceMemory),
            priceSteps: Number(priceSteps),
          },
          maxTxExecutionUnits: {
            memory: BigInt(raw.data.max_execution_units_per_transaction.memory),
            steps: BigInt(raw.data.max_execution_units_per_transaction.cpu),
          },
          maxTxSize: raw.data.max_transaction_size.bytes,
          maxValueSize: raw.data.max_value_size.bytes,
          minUTxOValue: BigInt(raw.data.min_utxo_deposit_constant.ada.lovelace),
          network: this.network,
          poolDeposit: BigInt(raw.data.stake_pool_deposit.ada.lovelace),
          protocolVersion: {
            major: raw.data.version.major,
            minor: raw.data.version.minor,
          },
          txFeeFixed: BigInt(raw.data.min_fee_constant.ada.lovelace),
          txFeePerByte: BigInt(raw.data.min_fee_coefficient),
        };
      });
  }
  async getNetworkContext(): Promise<NetworkContext> {
    return fetch(`${this.url}blocks/latest`, {
      headers: this.auth,
    })
      .then((res) => res.json())
      .then(
        (raw: RawNetworkContext): NetworkContext => ({
          blockHash: raw.data.hash,
          blockNo: raw.data.height,
          blockId: raw.data.height,
          epochNo: raw.data.epoch,
          slotNo: raw.data.absolute_slot,
          time: raw.data.timestamp,
          txCount: raw.data.tx_hashes.length,
          slotLeader: '',
        }),
      );
  }
  getUTxOByRef(ref: OutputReference): Promise<UTxO | undefined> {
    return fetch(
      `${this.url}transactions/${ref.txHash}/outputs/${ref.index}/txo`,
      {
        headers: this.auth,
      },
    )
      .then((res) => res.json())
      .catch(() => undefined)
      .then(async (rawUTxO: RawUTxO | undefined): Promise<UTxO | undefined> => {
        if (!rawUTxO) {
          return undefined;
        }
        const C = await CML;

        const currencies = Currencies.new(
          rawUTxO.data.assets.map((item) => {
            if (item.unit === 'lovelace') {
              return Currency.ada(BigInt(item.amount));
            } else {
              return Currency.new(
                BigInt(item.amount),
                AssetInfo.fromSubject(item.unit),
              );
            }
          }),
        );

        const wasmInput = C.TransactionInput.new(
          C.TransactionHash.from_hex(rawUTxO.data.tx_hash),
          BigInt(rawUTxO.data.index),
        );
        const wasmOutput = C.TransactionOutput.new(
          C.Address.from_bech32(rawUTxO.data.address),
          toWasmValue(C, currencies),
          rawUTxO.data?.datum?.bytes
            ? C.DatumOption.new_datum(
                C.PlutusData.from_cbor_hex(rawUTxO.data.datum.bytes),
              )
            : undefined,
        );

        const wasmUTxO = C.TransactionUnspentOutput.new(wasmInput, wasmOutput);

        return UTxO.new({
          cbor: wasmUTxO.to_cbor_hex(),
          spent: false,
        });
      });
  }
  getUTxOsByAddress(address: Bech32String): Promise<UTxO[]> {
    return fetch(`${this.url}addresses/${address}/utxos`, {
      headers: this.auth,
    })
      .then((res) => res.json())
      .then(async (rawUtxos: { data: RawUTxO['data'][] }): Promise<UTxO[]> => {
        const C = await CML;
        return rawUtxos.data.map((rawUTxO) => {
          const currencies = Currencies.new(
            rawUTxO.assets.map((item) => {
              if (item.unit === 'lovelace') {
                return Currency.ada(BigInt(item.amount));
              } else {
                return Currency.new(
                  BigInt(item.amount),
                  AssetInfo.fromSubject(item.unit),
                );
              }
            }),
          );

          const wasmInput = C.TransactionInput.new(
            C.TransactionHash.from_hex(rawUTxO.tx_hash),
            BigInt(rawUTxO.index),
          );
          const wasmOutput = C.TransactionOutput.new(
            C.Address.from_bech32(rawUTxO.address),
            toWasmValue(C, currencies),
            rawUTxO?.datum?.bytes
              ? C.DatumOption.new_datum(
                  C.PlutusData.from_cbor_hex(rawUTxO.datum.bytes),
                )
              : undefined,
          );

          const wasmUTxO = C.TransactionUnspentOutput.new(
            wasmInput,
            wasmOutput,
          );

          return UTxO.newSync(
            {
              cbor: wasmUTxO.to_cbor_hex(),
              spent: false,
            },
            C,
          );
        });
      });
  }

  evaluateTx(cbor: CborHexString): Promise<any> {
    console.log(cbor);
    throw new Error('Method not implemented.');
  }
  async submitTx(signedTxCbor: CborHexString): Promise<TransactionHash> {
    return fetch(`${this.url}txmanager`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/cbor',
        Accept: 'text/plain',
        ...this.auth,
      },
      body: (await CML).Transaction.from_cbor_hex(signedTxCbor).to_cbor_bytes(),
    }).then(async (res) => {
      const text = await res.text();

      if (!res.ok) {
        if (res.status === 400) throw new Error(text);
        else {
          throw new Error(
            'Could not submit transaction. Received status code: ' + res.status,
          );
        }
      }
      return text;
    });
  }
}
