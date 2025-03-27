import {
  AssetInfo,
  Bech32String,
  CborHexString,
  Currencies,
  Currency,
} from '@splashprotocol/core';
import type {
  TransactionOutput,
  Address,
  Value,
  MultiAsset,
} from '@dcspark/cardano-multiplatform-lib-browser';
import { CML } from '../../utils/Cml/Cml.ts';
import { InferPromise } from '../../types/InferPromise.ts';
import { ProtocolParams } from '../../types/ProtocolParams.ts';

const INSUFFICIENT_BYTES = 2;

export const toWasmValue = (
  C: InferPromise<typeof CML>,
  currencies: Currencies,
): Value => {
  const groupedAssetsByPolicyId = currencies
    .toArray()
    .filter((asset) => asset.asset.assetId !== AssetInfo.ada.assetId)
    .sort((aCurrency, bCurrency) => Number(aCurrency.amount - bCurrency.amount))
    .reduce<Map<string, Currency[]>>((acc, item) => {
      if (!acc.has(item.asset.policyId)) {
        acc.set(item.asset.policyId, []);
      }
      acc.set(
        item.asset.policyId,
        acc.get(item.asset.policyId)!.concat([item]),
      );

      return acc;
    }, new Map());

  const multiAssets: MultiAsset = Array.from<[string, Currency[]]>(
    groupedAssetsByPolicyId.entries(),
  ).reduce<MultiAsset>((ma, [policyId, currencies]) => {
    const wAssets = C.MapAssetNameToCoin.new();
    const wPolicyId = C.ScriptHash.from_hex(policyId);

    for (const currency of currencies) {
      wAssets.insert(
        C.AssetName.from_cbor_hex(currency.asset.nameCbor),
        currency.amount,
      );
    }

    ma.insert_assets(wPolicyId, wAssets);
    return ma;
  }, C.MultiAsset.new());

  const amount = currencies.ada?.amount;

  return multiAssets.keys().len()
    ? C.Value.new(amount || 0n, multiAssets)
    : C.Value.from_coin(amount || 0n);
};

const toWasmOutput = (
  C: InferPromise<typeof CML>,
  address: Bech32String,
  currencies: Currencies,
  data?: CborHexString,
): TransactionOutput => {
  let wasmAddress: Address;
  try {
    wasmAddress = C.Address.from_bech32(address);
  } catch (e) {
    throw new Error(`Invalid address format. ${address} isn't bech32`);
  }
  const wasmValue = toWasmValue(C, currencies);

  const output = data
    ? C.TransactionOutput.new(
        wasmAddress,
        wasmValue,
        C.DatumOption.new_datum(C.PlutusData.from_cbor_hex(data)),
      )
    : C.TransactionOutput.new(wasmAddress, wasmValue);

  return C.TransactionOutput.from_cbor_hex(output.to_canonical_cbor_hex());
};

export interface OutputParams {
  readonly address: Bech32String;
  readonly value: Currencies | Currency[];
  readonly data?: CborHexString;
}

interface InnerOutputParams {
  readonly address: Bech32String;
  readonly data?: CborHexString;
  readonly minAdaRequired: Currency;
  readonly userValue: Currencies;
  readonly isUserValueCoverMinAdaRequired: boolean;
  readonly totalValue: Currencies;
  readonly additionalAdaToCoverMinAdaRequired: Currency;
}

/**
 * Representation on transaction output
 */
export class Output {
  /**
   * Creates new Output sync using CML
   * @param C
   * @param pParams
   * @param address
   * @param value
   * @param data
   * @returns {Output}
   */
  static newSync(
    C: InferPromise<typeof CML>,
    pParams: ProtocolParams,
    { address, value, data }: OutputParams,
  ): Output {
    const normalizedCurrencies: Currencies =
      value instanceof Currencies ? value : Currencies.new(value || []);
    const outputExceptMinAdaRequired = toWasmOutput(
      C,
      address,
      normalizedCurrencies,
      data,
    );
    let minAdaRequiredAmount =
      BigInt(
        C.min_ada_required(
          outputExceptMinAdaRequired,
          pParams.coinsPerUtxoByte,
        ).toString(),
      ) + BigInt(Number(pParams.coinsPerUtxoByte) * INSUFFICIENT_BYTES);
    minAdaRequiredAmount =
      minAdaRequiredAmount >= pParams.minUTxOValue
        ? minAdaRequiredAmount
        : pParams.minUTxOValue;

    const minAdaRequired = Currency.ada(minAdaRequiredAmount);
    const userAda = normalizedCurrencies.ada || Currency.ada(0n);

    if (userAda.gte(minAdaRequired)) {
      return new Output(
        {
          minAdaRequired,
          address,
          data,
          userValue: normalizedCurrencies,
          totalValue: normalizedCurrencies,
          isUserValueCoverMinAdaRequired: true,
          additionalAdaToCoverMinAdaRequired: Currency.ada(0n),
        },
        C,
      );
    } else {
      const additionalAda = minAdaRequired.minus(userAda);
      const totalCurrencies = normalizedCurrencies.plus(
        Currencies.new([additionalAda]),
      );
      return new Output(
        {
          minAdaRequired,
          address,
          data,
          userValue: normalizedCurrencies,
          totalValue: totalCurrencies,
          isUserValueCoverMinAdaRequired: false,
          additionalAdaToCoverMinAdaRequired: additionalAda,
        },
        C,
      );
    }
  }

  /**
   * Creates new output async
   * @param pParams
   * @param params
   * @returns {Promise<Output>}
   */
  static async new(
    pParams: ProtocolParams,
    params: OutputParams,
  ): Promise<Output> {
    const C = await CML;

    return Output.newSync(C, pParams, params);
  }

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
   * @type {CborHexString}
   */
  public data: CborHexString | undefined;

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
    {
      minAdaRequired,
      address,
      userValue,
      data,
      totalValue,
      isUserValueCoverMinAdaRequired,
      additionalAdaToCoverMinAdaRequired,
    }: InnerOutputParams,
    private C: InferPromise<typeof CML>,
  ) {
    this.minAdaRequired = minAdaRequired;
    this.address = address;
    this.userValue = userValue;
    this.data = data;
    this.totalValue = totalValue;
    this.isUserValueCoverMinAdaRequired = isUserValueCoverMinAdaRequired;
    this.additionalAdaToCoverMinAdaRequired =
      additionalAdaToCoverMinAdaRequired;
  }

  get wasm(): TransactionOutput {
    return toWasmOutput(this.C, this.address, this.totalValue, this.data);
  }

  get cborHex(): CborHexString {
    return this.wasm.to_cbor_hex();
  }
}
