import {
  AssetInfo,
  Bech32String,
  Currencies,
  Currency,
  Network,
  OutputReference,
  TransactionHash,
} from '@splashprotocol/core';
import { UTxO } from '../../core/models/UTxO/UTxO.ts';
import { BuilderExplorer } from '../../core/types/BuilderExplorer.ts';
import { RawProtocolParams } from './methods/getProtocolParams/RawProtocolParams.ts';
import { ProtocolParams } from '../../core/types/ProtocolParams.ts';
import { NetworkContext } from '../../core/types/NetworkContext.ts';
import { UTxODescriptor } from './types/UTxODescriptor.ts';
import { CML } from '../../core/utils/Cml/Cml.ts';
import { toWasmValue } from '../../core/models/Output/Output.ts';

export const DEFAULT_MAINNET_EXPLORER_URL =
  'https://explorer.splash.trade/cardano/mainnet/';

export const DEFAULT_PREPROD_EXPLORER_URL =
  'https://explorer.splash.trade/cardano/preprod/';

export const DEFAULT_PREVIEW_EXPLORER_URL =
  'https://explorer.splash.trade/cardano/preview/';

export class SplashExplorer implements BuilderExplorer {
  static new(
    network: Network,
    explorerUrls?: Partial<SplashExplorer['explorerUrls']>,
  ) {
    return new SplashExplorer(network, explorerUrls);
  }

  private explorerUrls = {
    mainnet: DEFAULT_MAINNET_EXPLORER_URL,
    preprod: DEFAULT_PREPROD_EXPLORER_URL,
    preview: DEFAULT_PREVIEW_EXPLORER_URL,
  };

  constructor(
    public network: Network,
    explorerUrls?: Partial<typeof this.explorerUrls>,
  ) {
    this.explorerUrls = { ...this.explorerUrls, ...explorerUrls };
  }

  submitTx(): Promise<TransactionHash> {
    throw new Error('Method not implemented.');
  }

  get explorerUrl() {
    return this.explorerUrls[this.network];
  }

  /**
   * Return protocol params
   * @returns {Promise<ProtocolParams>}
   */
  async getProtocolParams(): Promise<ProtocolParams> {
    return fetch(`${this.explorerUrl}v1/networkParams`)
      .then((res) => res.json())
      .then((res) => res.pparams)
      .then(
        (data: RawProtocolParams): ProtocolParams => ({
          network: this.network,
          protocolVersion: data.protocolVersion,
          collateralPercentage: data.collateralPercentage,
          maxCollateralInputs: data.maxCollateralInputs,
          maxTxExecutionUnits: {
            memory: BigInt(data.maxTxExecutionUnits.memory),
            steps: BigInt(data.maxTxExecutionUnits.steps),
          },
          executionUnitPrices: {
            priceMemory: data.executionUnitPrices.priceMemory,
            priceSteps: data.executionUnitPrices.priceSteps,
          },
          costModels: data.costModels,
          coinsPerUtxoByte: BigInt(data.coinsPerUtxoByte),
          maxTxSize: data.maxTxSize,
          poolDeposit: BigInt(data.stakePoolDeposit),
          keyDeposit: BigInt(data.stakeAddressDeposit),
          txFeeFixed: BigInt(data.txFeeFixed),
          txFeePerByte: BigInt(data.txFeePerByte),
          minUTxOValue: BigInt(data.minUTxOValue),
          maxValueSize: data.maxValueSize,
        }),
      );
  }

  /**
   * Return protocol params
   * @returns {Promise<NetworkContext>}
   */
  async getNetworkContext(): Promise<NetworkContext> {
    return fetch(`${this.explorerUrl}v1/blocks/bestBlock`)
      .then((res) => res.json())
      .then((data) => ({ ...data }));
  }

  /**
   * Returns UTxO descriptor by output reference
   * @param { OutputReference | OutputReferenceHash} ref
   * @returns {UTxO | undefined}
   */
  getUTxOByRef(ref: OutputReference): Promise<UTxO | undefined> {
    return fetch(`${this.explorerUrl}v1/outputs/${ref.txHash}:${ref.index}`)
      .then((res) => (res.status === 404 ? undefined : res.json()))
      .then(async (uTxODescriptorOrNone: UTxODescriptor | undefined) => {
        if (!uTxODescriptorOrNone) {
          return undefined;
        }
        const C = await CML;

        const currencies = Currencies.new(
          uTxODescriptorOrNone.value.map((item) =>
            Currency.new(
              BigInt(item.jsQuantity),
              AssetInfo.fromBase16(item.policyId, item.nameHex),
            ),
          ),
        );

        const wasmInput = C.TransactionInput.new(
          C.TransactionHash.from_hex(uTxODescriptorOrNone.txHash),
          BigInt(uTxODescriptorOrNone.index),
        );
        const wasmOutput = C.TransactionOutput.new(
          C.Address.from_bech32(uTxODescriptorOrNone.addr),
          toWasmValue(C, currencies),
          uTxODescriptorOrNone.dataBin
            ? C.DatumOption.new_datum(
                C.PlutusData.from_cbor_hex(uTxODescriptorOrNone.dataBin),
              )
            : undefined,
        );
        const wasmUTxO = C.TransactionUnspentOutput.new(wasmInput, wasmOutput);

        return UTxO.new({
          cbor: wasmUTxO.to_cbor_hex(),
          spent: !!uTxODescriptorOrNone.spentByTxHash,
        });
      })
      .catch(() => {
        return undefined;
      });
  }

  async getUTxOsByAddress(address: Bech32String): Promise<UTxO[]> {
    const C = await CML;

    return fetch(
      `${this.explorerUrl}v1/outputs/unspent/byPaymentCred/${C.Address.from_bech32(address).payment_cred()!.as_pub_key()!.to_hex()}`,
    )
      .then((res) => res.json())
      .then((data) => data.items)
      .then((uTxODescriptors: UTxODescriptor[]) => {
        return Promise.all(
          uTxODescriptors.map((uTxoDescriptor) => {
            const currencies = Currencies.new(
              uTxoDescriptor.value.map((item) =>
                Currency.new(
                  BigInt(item.jsQuantity),
                  AssetInfo.fromBase16(item.policyId, item.nameHex),
                ),
              ),
            );

            const wasmInput = C.TransactionInput.new(
              C.TransactionHash.from_hex(uTxoDescriptor.txHash),
              BigInt(uTxoDescriptor.index),
            );
            const wasmOutput = C.TransactionOutput.new(
              C.Address.from_bech32(uTxoDescriptor.addr),
              toWasmValue(C, currencies),
              uTxoDescriptor.dataBin
                ? C.DatumOption.new_datum(
                    C.PlutusData.from_cbor_hex(uTxoDescriptor.dataBin),
                  )
                : undefined,
            );
            const wasmUTxO = C.TransactionUnspentOutput.new(
              wasmInput,
              wasmOutput,
            );

            return UTxO.new({
              cbor: wasmUTxO.to_cbor_hex(),
              spent: !!uTxoDescriptor.spentByTxHash,
            });
          }),
        );
      });
  }

  evaluateTx(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
