import {
  Address,
  AuxiliaryData,
  BaseAddress,
  ChangeSelectionAlgo,
  Credential,
  Ed25519KeyHash,
  Ed25519KeyHashList,
  EnterpriseAddress,
  ExUnits,
  Int,
  Metadata,
  MetadatumList,
  MetadatumMap,
  PartialPlutusWitness,
  PlutusScript,
  PlutusScriptWitness,
  PlutusV2Script,
  PlutusV3Script,
  RedeemerTag,
  RedeemerWitnessKey,
  RewardAddress,
  Script,
  SignedTxBuilder,
  SingleInputBuilder,
  SingleMintBuilder,
  SingleOutputBuilderResult,
  SingleWithdrawalBuilder,
  TransactionBuilder,
  TransactionBuilderConfig,
  TransactionMetadatum,
  TransactionWitnessSetBuilder,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Currencies } from '../../core/models/currencies/Currencies.ts';
import { Currency } from '../../core/models/currency/Currency.ts';
import { Data } from '../../core/models/data/data.ts';
import { Output } from '../../core/models/output/Output.ts';
import { Transaction } from '../../core/models/transaction/Transaction.ts';
import {
  ExternalInputDescriptor,
  TransactionCandidate,
} from '../../core/models/transactionCandidate/TransactionCandidate.ts';
import { UTxO } from '../../core/models/utxo/UTxO.ts';
import { ProtocolParams } from '../../core/types/ProtocolParams.ts';
import { SplashOperationsConfigWithCredsDeserializers } from '../../core/types/SplashOperationsConfig.ts';
import {
  Dictionary,
  HexString,
  OutputReference,
  uint,
} from '../../core/types/types.ts';
import { hexToBytes } from '../../core/utils/hexToBytes/hexToBytes.ts';
import { UTxOsSelector } from '../../core/utils/utxosSelector/UTxOsSelector.ts';
import { Splash } from '../splash.ts';
import { InsufficientCollateralError } from './erors/InsufficientCollateralError.ts';
import { InsufficientFundsErrorForChange } from './erors/InsufficientFundsErrorForChange.ts';
import { NoCollateralError } from './erors/NoCollateralError.ts';
import { cancelOperation } from './operations/cancelOperation/cancelOperation.ts';
import { Operation, OperationContext } from './operations/common/Operation.ts';
import { createCfmmPool } from './operations/createCfmmPool/createCfmmPool.ts';
import { createRoyaltyPool } from './operations/createRoyaltyPool/createRoyaltyPool.ts';
import { createWeightedPool } from './operations/createWeightedPool/createWeightedPool.ts';
import { payToAddress } from './operations/payToAddress/payToAddress.ts';
import { payToContract } from './operations/payToContract/payToContract.ts';
import {
  createSpotOrderData,
  spotOrder,
} from './operations/spotOrder/spotOrder.ts';
import { withdrawRoyalty } from './operations/withdrawRoyalty/withdrawRoyalty.ts';
import { DepositData, xyDeposit } from './operations/xyDeposit/xyDeposit.ts';
import { RedeemData, xyRedeem } from './operations/xyRedeem/xyRedeem.ts';
import { getTransactionBuilderConfig } from './utils/getTransactionBuilderConfig.ts';

interface CreateTransactionExtra {
  readonly prevTxFee?: bigint;
  readonly bestTxFee: bigint;
  readonly buildCounts: uint;
}

export const defaultOperations: {
  payToAddress: typeof payToAddress;
  payToContract: typeof payToContract;
  xyDeposit: typeof xyDeposit;
  xyRedeem: typeof xyRedeem;
  spotOrder: typeof spotOrder;
  cancelOperation: typeof cancelOperation;
  createWeightedPool: typeof createWeightedPool;
  createCfmmPool: typeof createCfmmPool;
  createRoyaltyPool: typeof createRoyaltyPool;
  withdrawRoyalty: typeof withdrawRoyalty;
} = {
  payToAddress,
  payToContract,
  xyDeposit,
  xyRedeem,
  spotOrder,
  cancelOperation,
  createWeightedPool,
  createCfmmPool,
  createRoyaltyPool,
  withdrawRoyalty,
};

export type TxBuilder<O extends Dictionary<Operation<any>>> = {
  [key in keyof O]: (...args: Parameters<O[key]>) => TxBuilder<O>;
} & {
  tasks: ReturnType<Operation<any>>[];
  complete(): Promise<Transaction>;
};

export class TxBuilderFactory<O extends Dictionary<Operation<any>>> {
  private protocolParamsP: Promise<ProtocolParams>;

  private additionalOperations: Dictionary<Operation<any>>;

  private transactionBuilderConfigP: Promise<TransactionBuilderConfig>;

  constructor(
    public splash: Splash<{}>,
    additionalOperations: Dictionary<Operation<any>> = {},
  ) {
    this.protocolParamsP = this.splash.api.getProtocolParams();
    this.additionalOperations = additionalOperations;
    this.transactionBuilderConfigP = this.protocolParamsP.then(
      getTransactionBuilderConfig,
    );
  }

  newTx(): TxBuilder<typeof defaultOperations & O> {
    const tasks: ReturnType<Operation<any>>[] = [];

    //@ts-ignore
    return Object.entries({
      ...defaultOperations,
      ...this.additionalOperations,
    }).reduce<TxBuilder<any>>(
      (acc, [name, op]) =>
        ({
          ...acc,
          [name]: function (...args: any[]) {
            tasks.push(op(...args));
            return this;
          },
        }) as any,
      {
        tasks,
        complete: async (): Promise<Transaction> => {
          const operationContext = await this.getOperationContext();
          await tasks.reduce<Promise<any>>(
            (taskChain, task) => taskChain.then(() => task(operationContext)),
            Promise.resolve(),
          );
          // await Promise.all(tasks.map((task) => task(operationContext)));

          return this.createTransaction(operationContext);
        },
      } as TxBuilder<any>,
    );
  }

  private async getMappedOperationsConfig(): Promise<SplashOperationsConfigWithCredsDeserializers> {
    const rawOperationsConfig = await this.splash.operationsConfig;
    const anyRedeemOrDepositDeserializer = (
      dataStructure: typeof RedeemData | typeof DepositData,
    ): SplashOperationsConfigWithCredsDeserializers['operations']['spotOrder']['credsDeserializer'] => {
      return (networkId, data) => {
        const deserializedData = dataStructure.deserialize(data);
        const pkh = deserializedData[5];
        const skh = deserializedData[6];

        const address = skh
          ? BaseAddress.new(
              Number(networkId.network()),
              Credential.new_pub_key(Ed25519KeyHash.from_hex(pkh)),
              Credential.new_pub_key(Ed25519KeyHash.from_hex(skh)),
            )
          : EnterpriseAddress.new(
              Number(networkId.network()),
              Credential.new_pub_key(Ed25519KeyHash.from_hex(pkh)),
            );

        return {
          address: address.to_address().to_bech32(),
          requiredSigner: pkh,
        };
      };
    };

    return {
      operations: {
        swapDefault: {
          ...rawOperationsConfig.operations.swapDefault,
          credsDeserializer: (networkId, data) => {
            const deserializedData = Data.Tuple([
              Data.AssetInfo,
              Data.AssetInfo,
              Data.AssetInfo,
              Data.Int,
              Data.BigInt,
              Data.BigInt,
              Data.Bytes,
              Data.Optional(Data.Bytes),
              Data.BigInt,
              Data.BigInt,
            ]).deserialize(data);
            const pkh = deserializedData[6];
            const skh = deserializedData[7];

            const address = skh
              ? BaseAddress.new(
                  Number(networkId.network()),
                  Credential.new_pub_key(Ed25519KeyHash.from_hex(pkh)),
                  Credential.new_pub_key(Ed25519KeyHash.from_hex(skh)),
                )
              : EnterpriseAddress.new(
                  Number(networkId.network()),
                  Credential.new_pub_key(Ed25519KeyHash.from_hex(pkh)),
                );

            return {
              requiredSigner: pkh,
              address: address.to_address().to_bech32(),
            };
          },
        },
        spotOrder: {
          ...rawOperationsConfig.operations.spotOrder,
          credsDeserializer: (networkId, data) => {
            const deserializedData =
              createSpotOrderData(networkId).deserialize(data);

            return {
              address: deserializedData[9],
              requiredSigner: deserializedData[10],
            };
          },
        },
        spotOrderV2: {
          ...rawOperationsConfig.operations.spotOrderV2,
          credsDeserializer: (networkId, data) => {
            const deserializedData =
              createSpotOrderData(networkId).deserialize(data);

            return {
              address: deserializedData[9],
              requiredSigner: deserializedData[10],
            };
          },
        },
        spotOrderV3: {
          ...rawOperationsConfig.operations.spotOrderV3,
          credsDeserializer: (networkId, data) => {
            const deserializedData =
              createSpotOrderData(networkId).deserialize(data);

            return {
              address: deserializedData[9],
              requiredSigner: deserializedData[10],
            };
          },
        },
        redeemFeeSwitch: {
          ...rawOperationsConfig.operations.redeemFeeSwitch,
          credsDeserializer: anyRedeemOrDepositDeserializer(RedeemData),
        },
        redeemWeighted: {
          ...rawOperationsConfig.operations.redeemWeighted,
          credsDeserializer: anyRedeemOrDepositDeserializer(RedeemData),
        },
        redeemWeightedV2: {
          ...rawOperationsConfig.operations.redeemWeightedV2,
          credsDeserializer: anyRedeemOrDepositDeserializer(RedeemData),
        },
        redeemDefault: {
          ...rawOperationsConfig.operations.redeemDefault,
          credsDeserializer: anyRedeemOrDepositDeserializer(RedeemData),
        },
        redeemStable: {
          ...rawOperationsConfig.operations.redeemStable,
          credsDeserializer: anyRedeemOrDepositDeserializer(RedeemData),
        },
        redeemRoyalty: {
          ...rawOperationsConfig.operations.redeemRoyalty,
          credsDeserializer: anyRedeemOrDepositDeserializer(RedeemData),
        },
        depositDefault: {
          ...rawOperationsConfig.operations.depositDefault,
          credsDeserializer: anyRedeemOrDepositDeserializer(DepositData),
        },
        depositWeighted: {
          ...rawOperationsConfig.operations.depositWeighted,
          credsDeserializer: anyRedeemOrDepositDeserializer(DepositData),
        },
        depositWeightedOld: {
          ...rawOperationsConfig.operations.depositWeightedOld,
          credsDeserializer: anyRedeemOrDepositDeserializer(DepositData),
        },
        depositFeeSwitch: {
          ...rawOperationsConfig.operations.depositFeeSwitch,
          credsDeserializer: anyRedeemOrDepositDeserializer(DepositData),
        },
        depositStable: {
          ...rawOperationsConfig.operations.depositStable,
          credsDeserializer: anyRedeemOrDepositDeserializer(DepositData),
        },
        depositRoyalty: {
          ...rawOperationsConfig.operations.depositRoyalty,
          credsDeserializer: anyRedeemOrDepositDeserializer(DepositData),
        },
      },
    };
  }

  private async getOperationContext(): Promise<OperationContext> {
    const transactionCandidate = TransactionCandidate.new();
    const pParams = await this.protocolParamsP;
    const userAddress = await this.splash.api.getActiveAddress();
    const nContext = await this.splash.api.getNetworkContext();
    const uTxOs = await this.splash.api.getUTxOs();
    const operationsConfig = await this.getMappedOperationsConfig();
    const uTxOsSelector = UTxOsSelector.new({
      transactionCandidate,
      uTxOs,
    });
    const collateralSelector = UTxOsSelector.new({
      uTxOs: await this.splash.api.getCollaterals(),
    });

    return {
      transactionCandidate,
      collateralSelector,
      uTxOsSelector,
      userAddress,
      pParams,
      operationsConfig,
      utils: this.splash.utils,
      network: this.splash.network,
      nContext,
      splash: this.splash,
    };
  }

  private async createTransaction(
    context: OperationContext,
    { prevTxFee, bestTxFee, buildCounts }: CreateTransactionExtra = {
      prevTxFee: undefined,
      buildCounts: 1,
      bestTxFee: context.transactionCandidate.maxTxFee.amount,
    },
  ): Promise<Transaction> {
    try {
      const { txBuilder, partialSign, remoteCollateral } =
        await this.createSignedTransactionBuilder(
          context,
          Currency.ada(bestTxFee),
        );
      if (txBuilder.body().fee() === prevTxFee) {
        return Transaction.new(
          {
            transaction: txBuilder,
            partialSign,
            remoteCollateral,
            additionalData: context.transactionCandidate.additionalData,
          },
          context.splash,
        );
      }
      if (buildCounts > 3) {
        return Transaction.new(
          {
            transaction:
              txBuilder.body().fee() > bestTxFee
                ? (
                    await this.createSignedTransactionBuilder(
                      context,
                      Currency.ada(bestTxFee),
                    )
                  ).txBuilder
                : txBuilder,
            partialSign,
            remoteCollateral,
            additionalData: context.transactionCandidate.additionalData,
          },
          context.splash,
        );
      }
      return this.createTransaction(context, {
        buildCounts: buildCounts + 1,
        prevTxFee: txBuilder.body().fee(),
        bestTxFee:
          txBuilder.body().fee() > bestTxFee
            ? bestTxFee
            : txBuilder.body().fee(),
      });
    } catch (e) {
      throw e;
    }
  }

  private async createSignedTransactionBuilder(
    {
      transactionCandidate,
      uTxOsSelector,
      userAddress,
      splash,
      collateralSelector,
      ...rest
    }: OperationContext,
    txFee: Currency = transactionCandidate.maxTxFee,
  ): Promise<{
    txBuilder: SignedTxBuilder;
    partialSign: boolean;
    remoteCollateral: boolean;
  }> {
    const transactionBuilder = TransactionBuilder.new(
      await this.transactionBuilderConfigP,
    );

    const scriptInputs = transactionCandidate.inputs.filter(
      (input): input is ExternalInputDescriptor => !!input.extra,
    );
    const scriptsInputsValue = scriptInputs.reduce(
      (total, scriptInput) => total.plus(scriptInput.uTxO.value),
      Currencies.empty,
    );
    const withdrawals = transactionCandidate.withdrawals;
    const mints = transactionCandidate.mints;
    const mintsInputValue = mints.reduce(
      (total, mint) => total.plus([mint.currency]),
      Currencies.empty,
    );

    const totalOutputValue = transactionCandidate.outputs.reduce(
      (total, output) => total.plus(output.totalValue),
      Currencies.new([txFee]),
    );
    const maxCollateralsValue = Currencies.new([
      transactionCandidate.maxTxFee.multiply(3n),
    ]);
    const userUTxOsForOutput = scriptsInputsValue
      .plus(mintsInputValue)
      .isAssetsEnough(totalOutputValue)
      ? []
      : uTxOsSelector['selectForTransactionBuilder'](
          scriptsInputsValue
            .plus(mintsInputValue)
            .getInsufficientCurrenciesFor(totalOutputValue),
        );

    const allUTxOs = this.normalizeUTxOsForChange(
      totalOutputValue,
      mintsInputValue,
      userUTxOsForOutput.concat(
        scriptInputs.map((scriptInput) => scriptInput.uTxO),
      ),
      transactionBuilder,
      {
        transactionCandidate,
        uTxOsSelector,
        userAddress,
        splash,
        collateralSelector,
        ...rest,
      },
    );
    const allInternalUTxOs = allUTxOs.filter((uTxO) =>
      scriptInputs.every(
        (si) =>
          `${uTxO.ref.txHash}:${uTxO.ref.index}` !==
          `${si.uTxO.ref.txHash}:${si.uTxO.ref.index}`,
      ),
    );

    // COLLATERALS
    let collaterals: UTxO[] = [];
    let remoteCollaterals: { uTxO: UTxO; requiredSigner: HexString }[] = [];

    if (scriptInputs.length || mints.length) {
      try {
        if (!collateralSelector['uTxOs'].length) {
          throw new NoCollateralError('wallet has no collateral UTxO');
        }
        collaterals = collateralSelector.select(maxCollateralsValue);
      } catch (e) {
        if (this.splash['remoteCollaterals']) {
          const collaterals =
            await this.splash['remoteCollaterals'].getCollaterals();
          remoteCollaterals = (
            await Promise.all(
              collaterals.map((c) => {
                const [txHash, index] = c.outputReferenceHash.split(':');
                return splash.api
                  .getUTxOByRef({
                    txHash,
                    index: BigInt(index),
                  })
                  .then((uTxO) => ({
                    uTxO: uTxO!,
                    requiredSigner: Address.from_bech32(c.address)
                      .payment_cred()
                      ?.as_pub_key()
                      ?.to_hex()!,
                  }));
              }),
            )
          ).filter((item) => item.uTxO);
        }
        if (!remoteCollaterals.length) {
          throw e instanceof NoCollateralError
            ? e
            : new InsufficientCollateralError(
                'insufficient collateral in wallet',
              );
        }
      }
    }

    // REF INPUTS
    const allRefUTxOsInfo = Object.values(
      scriptInputs
        .map((si) => si.extra.scriptRef)
        .reduce<Dictionary<OutputReference>>(
          (dict, ref) => ({
            ...dict,
            [`${ref.txHash}:${ref.index}`]: ref,
          }),
          {},
        ),
    );
    const allRefUTxOs = (await Promise.all(
      allRefUTxOsInfo.map((ref) => splash.api.getUTxOByRef(ref)),
    )) as UTxO[];
    if (allRefUTxOs.some((refUTxO) => !refUTxO)) {
      // TODO: ADD CUSTOM ERROR
      throw new Error('some of ref uTxO not found');
    }

    collaterals.forEach((collateralUTxO) =>
      transactionBuilder.add_collateral(
        SingleInputBuilder.from_transaction_unspent_output(
          collateralUTxO.wasm,
        ).payment_key(),
      ),
    );
    remoteCollaterals.forEach(({ uTxO, requiredSigner }) => {
      transactionBuilder.add_collateral(
        SingleInputBuilder.from_transaction_unspent_output(
          uTxO.wasm,
        ).payment_key(),
      );
      transactionBuilder.add_required_signer(
        Ed25519KeyHash.from_hex(requiredSigner),
      );
    });
    if (collaterals.length) {
      const collateralReturnOutput = Output.new(rest.pParams, {
        address: userAddress,
        value: collaterals
          .reduce(
            (total, collaterals) => total.plus(collaterals.value),
            Currencies.empty,
          )
          .minus(maxCollateralsValue),
      });
      if (
        !collateralReturnOutput.additionalAdaToCoverMinAdaRequired.isPositive()
      ) {
        transactionBuilder.set_collateral_return(collateralReturnOutput.wasm);
      }
    }

    allRefUTxOs.forEach((refUTxO) =>
      transactionBuilder.add_reference_input(refUTxO.wasm),
    );
    allInternalUTxOs.forEach((uTxO) =>
      transactionBuilder.add_input(
        SingleInputBuilder.from_transaction_unspent_output(
          uTxO.wasm,
        ).payment_key(),
      ),
    );
    scriptInputs.forEach((input) => {
      const requiredSigners = Ed25519KeyHashList.new();
      input.extra.requiredSigners.forEach((rs) =>
        requiredSigners.add(Ed25519KeyHash.from_hex(rs)),
      );
      const partialPlutusWitness = PartialPlutusWitness.new(
        // PlutusScriptWitness.new_ref(ScriptHash.from_hex(input.extra.script)),
        PlutusScriptWitness.new_script(
          PlutusScript.from_v2(
            PlutusV2Script.from_cbor_hex(input.extra.plutusV2ScriptCbor),
          ),
        ),
        input.extra.redeemer,
      );
      const builder = SingleInputBuilder.from_transaction_unspent_output(
        input.uTxO.wasm,
      ).plutus_script_inline_datum(partialPlutusWitness, requiredSigners);
      transactionBuilder.add_input(builder);
    });

    const mintsMetadatumMap: MetadatumMap = MetadatumMap.new();
    mints
      .slice()
      .sort((a, b) => {
        const result = a.currency.asset.policyId.localeCompare(
          b.currency.asset.policyId,
        );

        if (result !== 0) {
          return result;
        }
        return a.currency.asset.nameBase16.localeCompare(
          b.currency.asset.nameBase16,
        );
      })
      .forEach((mint) => {
        const requiredSigners = Ed25519KeyHashList.new();
        const partialPlutusWitness = PartialPlutusWitness.new(
          PlutusScriptWitness.new_script(
            mint.script.type === 'plutusV2'
              ? PlutusScript.from_v2(
                  PlutusV2Script.from_cbor_hex(mint.script.value),
                )
              : PlutusScript.from_v3(
                  PlutusV3Script.from_cbor_hex(mint.script.value),
                ),
          ),
          mint.redeemer,
        );
        transactionBuilder.add_mint(
          SingleMintBuilder.new_single_asset(
            mint.currency.asset.wasmName,
            mint.currency.amount,
          ).plutus_script(partialPlutusWitness, requiredSigners),
        );
        if (mint.cip25) {
          const metadatumMap = MetadatumMap.new();
          metadatumMap.set(
            TransactionMetadatum.new_text('name'),
            TransactionMetadatum.new_text(mint.cip25.name),
          );
          metadatumMap.set(
            TransactionMetadatum.new_text('image'),
            TransactionMetadatum.new_text(mint.cip25.image),
          );
          if (mint.cip25.ticker) {
            metadatumMap.set(
              TransactionMetadatum.new_text('ticker'),
              TransactionMetadatum.new_text(mint.cip25.ticker),
            );
          }
          if (mint.cip25.socials) {
            const socialsMap = MetadatumMap.new();

            if (mint.cip25.socials.discord) {
              socialsMap.set(
                TransactionMetadatum.new_text('discord'),
                TransactionMetadatum.new_text(mint.cip25.socials.discord),
              );
            }
            if (mint.cip25.socials.twitter) {
              socialsMap.set(
                TransactionMetadatum.new_text('twitter'),
                TransactionMetadatum.new_text(mint.cip25.socials.twitter),
              );
            }
            if (mint.cip25.socials.website) {
              socialsMap.set(
                TransactionMetadatum.new_text('website'),
                TransactionMetadatum.new_text(mint.cip25.socials.website),
              );
            }
            if (mint.cip25.socials.telegram) {
              socialsMap.set(
                TransactionMetadatum.new_text('telegram'),
                TransactionMetadatum.new_text(mint.cip25.socials.telegram),
              );
            }

            metadatumMap.set(
              TransactionMetadatum.new_text('socials'),
              TransactionMetadatum.new_map(socialsMap),
            );
          }
          metadatumMap.set(
            TransactionMetadatum.new_text('poolAuthor'),
            TransactionMetadatum.new_text(mint.cip25.poolAuthor),
          );

          const descriptionChunks =
            mint.cip25.description.match(/.{1,64}/g) || [];
          const descriptionList = MetadatumList.new();
          descriptionChunks.forEach((chunk) =>
            descriptionList.add(TransactionMetadatum.new_text(chunk)),
          );

          metadatumMap.set(
            TransactionMetadatum.new_text('description'),
            descriptionChunks.length > 1
              ? TransactionMetadatum.new_list(descriptionList)
              : TransactionMetadatum.new_text(mint.cip25.description),
          );

          const cip25Metadatum = MetadatumMap.new();
          cip25Metadatum.set(
            TransactionMetadatum.new_text(mint.cip25.name),
            TransactionMetadatum.new_map(metadatumMap),
          );
          mintsMetadatumMap.set(
            TransactionMetadatum.new_text(mint.currency.asset.policyId),
            TransactionMetadatum.new_map(cip25Metadatum),
          );
        }
      });
    if (mintsMetadatumMap.len() || transactionCandidate.metadata.length) {
      const finalMetadata = Metadata.new();

      transactionCandidate.metadata.forEach((metadataItem) => {
        if (typeof metadataItem[1] === 'string') {
          const metadataChunks = metadataItem[1].match(/.{1,64}/g) || [];
          const metadataList = MetadatumList.new();
          metadataChunks.forEach((chunk) =>
            metadataList.add(TransactionMetadatum.new_bytes(hexToBytes(chunk))),
          );
          finalMetadata.set(
            metadataItem[0],
            metadataChunks.length > 1
              ? TransactionMetadatum.new_list(metadataList)
              : TransactionMetadatum.new_text(metadataItem[1]),
          );
        } else {
          finalMetadata.set(
            metadataItem[0],
            TransactionMetadatum.new_int(Int.new(metadataItem[1])),
          );
        }
      });

      if (mintsMetadatumMap.len()) {
        finalMetadata.set(
          721n,
          TransactionMetadatum.new_map(mintsMetadatumMap),
        );
      }

      transactionBuilder.set_auxiliary_data(
        AuxiliaryData.new_shelley(finalMetadata),
      );
    }
    withdrawals.forEach((withdrawal) => {
      const requiredSigners = Ed25519KeyHashList.new();
      const partialPlutusWitness = PartialPlutusWitness.new(
        PlutusScriptWitness.new_script(
          PlutusScript.from_v2(
            PlutusV2Script.from_cbor_hex(withdrawal.plutusV2ScriptCbor),
          ),
        ),
        withdrawal.redeemer,
      );
      transactionBuilder.add_withdrawal(
        SingleWithdrawalBuilder.new(
          RewardAddress.from_address(
            Address.from_bech32(withdrawal.rewardAddress),
          )!,
          withdrawal.amount,
        ).plutus_script(partialPlutusWitness, requiredSigners),
      );
    });

    transactionCandidate.outputs.forEach((output) =>
      transactionBuilder.add_output(SingleOutputBuilderResult.new(output.wasm)),
    );

    transactionCandidate.requiredSigners.forEach((requiredSigners) =>
      transactionBuilder.add_required_signer(
        Ed25519KeyHash.from_hex(requiredSigners),
      ),
    );

    const wasmChangeAddress = Address.from_bech32(userAddress);
    const changeSelectionAlgo = Number(ChangeSelectionAlgo.Default.toString());

    if (!collaterals.length && !remoteCollaterals.length) {
      return {
        txBuilder: transactionBuilder.build(
          changeSelectionAlgo,
          wasmChangeAddress,
        ),
        partialSign: false,
        remoteCollateral: false,
      };
    }

    const txForEvaluations = transactionBuilder.build_for_evaluation(
      changeSelectionAlgo,
      wasmChangeAddress,
    );
    const txForEvaluationInputs = txForEvaluations.draft_body().inputs();
    const txForEvaluationMints = txForEvaluations.draft_body().mint()!;
    const txForEvaluationWithdrawals = txForEvaluations
      .draft_body()
      .withdrawals()!;

    withdrawals.forEach((withdrawal) => {
      let withdrawalIndex = 0n;
      for (let i = 0; i < txForEvaluationWithdrawals.keys().len(); i++) {
        const rewardAddress = txForEvaluationWithdrawals
          .keys()
          .get(i)
          .to_address()
          .to_bech32();

        if (rewardAddress === withdrawal.rewardAddress) {
          withdrawalIndex = BigInt(i);
          break;
        }
      }
      transactionBuilder.set_exunits(
        RedeemerWitnessKey.new(RedeemerTag.Reward, withdrawalIndex),
        ExUnits.new(withdrawal.exUnits.mem, withdrawal.exUnits.steps),
      );
    });
    mints.forEach((mint) => {
      let mintIndex = 0n;
      for (let i = 0; i < txForEvaluationMints.keys().len(); i++) {
        const policyId = txForEvaluationMints.keys().get(i).to_hex();

        if (policyId === mint.currency.asset.policyId) {
          mintIndex = BigInt(i);
          break;
        }
      }
      transactionBuilder.set_exunits(
        RedeemerWitnessKey.new(RedeemerTag.Mint, mintIndex),
        ExUnits.new(mint.exUnits.mem, mint.exUnits.steps),
      );
    });
    scriptInputs.forEach((scriptInput) => {
      let txInputIndex = 0n;

      for (let i = 0; i < txForEvaluationInputs.len(); i++) {
        const inputTxHash = txForEvaluationInputs
          .get(i)
          .transaction_id()
          .to_hex();
        const inputIndex = txForEvaluationInputs.get(i).index();

        if (
          inputIndex === scriptInput.uTxO.ref.index &&
          inputTxHash === scriptInput.uTxO.ref.txHash
        ) {
          txInputIndex = BigInt(i);
          break;
        }
      }
      transactionBuilder.set_exunits(
        RedeemerWitnessKey.new(RedeemerTag.Spend, txInputIndex),
        ExUnits.new(
          scriptInput.extra.exUnits.mem,
          scriptInput.extra.exUnits.steps,
        ),
      );
    });
    // change here
    // transactionBuilder.add_required_signer(
    //   wasmChangeAddress.payment_cred()?.as_pub_key()!,
    // );
    // transactionBuilder.add_required_signer(
    //   Address.from_bech32(
    //     'addr1q8gapqxkzlxl0mrakpmh2tmnnvstzsaxpujqjemv0wghesn6kp96j7wmh4yydp7dr5qk0rhxejlg9akzhwf7528a2fqq9926pr',
    //   )
    //     .payment_cred()
    //     ?.as_pub_key()!,
    // );

    const uncheckedSignedTxBuilder = transactionBuilder.build(
      changeSelectionAlgo,
      wasmChangeAddress,
    );
    const uncheckedWitnessSetBuilder = uncheckedSignedTxBuilder
      .build_unchecked()
      .witness_set();
    const txWitnessSetBuilder = TransactionWitnessSetBuilder.new();

    txWitnessSetBuilder.add_required_wits(
      uncheckedSignedTxBuilder.witness_set().remaining_wits(),
    );

    if (uncheckedWitnessSetBuilder.redeemers()) {
      const redeemersToAdd = uncheckedWitnessSetBuilder
        .redeemers()!
        .as_arr_legacy_redeemer()!;

      for (let i = 0; i < redeemersToAdd.len(); i++) {
        txWitnessSetBuilder.add_redeemer(redeemersToAdd.get(i));
      }
    }
    if (uncheckedWitnessSetBuilder.vkeywitnesses()) {
      const vkeywitnessesToAdd = uncheckedWitnessSetBuilder.vkeywitnesses()!;

      for (let i = 0; i < vkeywitnessesToAdd.len(); i++) {
        txWitnessSetBuilder.add_vkey(vkeywitnessesToAdd.get(i));
      }
    }
    if (uncheckedWitnessSetBuilder.plutus_datums()) {
      const plutusDatumsToAdd = uncheckedWitnessSetBuilder.plutus_datums()!;

      for (let i = 0; i < plutusDatumsToAdd.len(); i++) {
        txWitnessSetBuilder.add_plutus_datum(plutusDatumsToAdd.get(i));
      }
    }
    if (uncheckedWitnessSetBuilder.bootstrap_witnesses()) {
      const bootstrapWitnessesToAdd =
        uncheckedWitnessSetBuilder.bootstrap_witnesses()!;

      for (let i = 0; i < bootstrapWitnessesToAdd.len(); i++) {
        txWitnessSetBuilder.add_bootstrap(bootstrapWitnessesToAdd.get(i));
      }
    }
    mints.forEach((mint) => {
      txWitnessSetBuilder.add_script(
        mint.script.type === 'plutusV2'
          ? Script.new_plutus_v2(
              PlutusV2Script.from_cbor_hex(mint.script.value),
            )
          : Script.new_plutus_v3(
              PlutusV3Script.from_cbor_hex(mint.script.value),
            ),
      );
    });
    withdrawals.forEach((withdrawal) => {
      txWitnessSetBuilder.add_script(
        Script.new_plutus_v2(
          PlutusV2Script.from_cbor_hex(withdrawal.plutusV2ScriptCbor),
        ),
      );
    });

    if (txForEvaluations.auxiliary_data()) {
      return {
        txBuilder: SignedTxBuilder.new_with_data(
          transactionBuilder
            .build(changeSelectionAlgo, wasmChangeAddress)
            .body(),
          txWitnessSetBuilder,
          txForEvaluations.draft_tx().is_valid(),
          txForEvaluations.auxiliary_data()!,
        ),
        partialSign: true,
        remoteCollateral: remoteCollaterals.length > 0,
      };
    } else {
      return {
        txBuilder: SignedTxBuilder.new_without_data(
          transactionBuilder
            .build(changeSelectionAlgo, wasmChangeAddress)
            .body(),
          txWitnessSetBuilder,
          txForEvaluations.draft_tx().is_valid(),
        ),
        partialSign: true,
        remoteCollateral: remoteCollaterals.length > 0,
      };
    }
  }

  private normalizeUTxOsForChange(
    totalOutputValue: Currencies,
    mintsInputValue: Currencies,
    uTxOsForOutput: UTxO[],
    transactionBuilder: TransactionBuilder,
    context: OperationContext,
  ): UTxO[] {
    const estimatedChange = uTxOsForOutput
      .reduce((acc, uTxO) => acc.plus(uTxO.value), Currencies.empty)
      .plus(mintsInputValue)
      .minus(totalOutputValue);
    const estimatedChangeOutput = Output.new(context.pParams, {
      address: context.userAddress,
      value: estimatedChange,
    });
    const extraOutputFee = Currency.ada(
      BigInt(
        estimatedChangeOutput.wasm.to_cbor_bytes().length *
          // TODO: FIX
          2 *
          Number(context.pParams.txFeePerByte),
      ),
    );

    if (
      estimatedChange.ada.gte(
        estimatedChangeOutput.minAdaRequired.plus(extraOutputFee),
      )
    ) {
      return uTxOsForOutput;
    }
    let additionalUTxOs: UTxO[];

    try {
      additionalUTxOs = context.uTxOsSelector.select(
        Currencies.new([
          estimatedChangeOutput.minAdaRequired
            .plus(extraOutputFee)
            .minus(estimatedChange.ada),
        ]),
        {
          exclude: uTxOsForOutput,
        },
      );
    } catch (e) {
      throw new InsufficientFundsErrorForChange(
        'insufficient funds for change',
      );
    }
    return this.normalizeUTxOsForChange(
      totalOutputValue,
      mintsInputValue,
      uTxOsForOutput.concat(additionalUTxOs),
      transactionBuilder,
      context,
    );
  }
}
