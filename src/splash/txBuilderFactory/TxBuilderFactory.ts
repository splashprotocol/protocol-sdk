import {
  Address,
  BaseAddress,
  ChangeSelectionAlgo,
  Credential,
  Ed25519KeyHash,
  EnterpriseAddress,
  ExUnits,
  PartialPlutusWitness,
  PlutusScript,
  PlutusScriptWitness,
  PlutusV2Script,
  RedeemerTag,
  RedeemerWitnessKey,
  RequiredSigners,
  Script,
  SignedTxBuilder,
  SingleInputBuilder,
  SingleMintBuilder,
  SingleOutputBuilderResult,
  TransactionBuilder,
  TransactionBuilderConfig,
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
import { Dictionary, OutputReference, uint } from '../../core/types/types.ts';
import { MAX_TRANSACTION_FEE } from '../../core/utils/transactionFee/transactionFee.ts';
import { UTxOsSelector } from '../../core/utils/utxosSelector/UTxOsSelector.ts';
import { Splash } from '../splash.ts';
import { InsufficientCollateralError } from './erors/InsufficientCollateralError.ts';
import { InsufficientFundsErrorForChange } from './erors/InsufficientFundsErrorForChange.ts';
import { NoCollateralError } from './erors/NoCollateralError.ts';
import { cancelOperation } from './operations/cancelOperation/cancelOperation.ts';
import {
  cfmmOrWeightedDeposit,
  DepositData,
} from './operations/cfmmOrWeightedDeposit/cfmmOrWeightedDeposit.ts';
import {
  cfmmOrWeightedRedeem,
  RedeemData,
} from './operations/cfmmOrWeightedRedeem/cfmmOrWeightedRedeem.ts';
import { Operation, OperationContext } from './operations/common/Operation.ts';
import { createCfmmPool } from './operations/createCfmmPool/createCfmmPool.ts';
import { createWeightedPool } from './operations/createWeightedPool/createWeightedPool.ts';
import { payToAddress } from './operations/payToAddress/payToAddress.ts';
import { payToContract } from './operations/payToContract/payToContract.ts';
import {
  createSpotOrderData,
  spotOrder,
} from './operations/spotOrder/spotOrder.ts';
import { getTransactionBuilderConfig } from './utils/getTransactionBuilderConfig.ts';

interface CreateTransactionExtra {
  readonly prevTxFee?: bigint;
  readonly bestTxFee: bigint;
  readonly buildCounts: uint;
}

export const defaultOperations: {
  payToAddress: typeof payToAddress;
  payToContract: typeof payToContract;
  cfmmOrWeightedDeposit: typeof cfmmOrWeightedDeposit;
  cfmmOrWeightedRedeem: typeof cfmmOrWeightedRedeem;
  spotOrder: typeof spotOrder;
  cancelOperation: typeof cancelOperation;
  createWeightedPool: typeof createWeightedPool;
  createCfmmPool: typeof createCfmmPool;
} = {
  payToAddress,
  payToContract,
  cfmmOrWeightedDeposit,
  cfmmOrWeightedRedeem,
  spotOrder,
  cancelOperation,
  createWeightedPool,
  createCfmmPool,
};

export type TxBuilder<O extends Dictionary<Operation<any>>> = {
  [key in keyof O]: (...args: Parameters<O[key]>) => TxBuilder<O>;
} & {
  tasks: ReturnType<Operation<any>>[];
  complete(): Promise<Transaction>;
};

export class TxBuilderFactory<O extends Dictionary<Operation<any>>> {
  private protocolParamsP: Promise<ProtocolParams>;

  private transactionBuilderConfigP: Promise<TransactionBuilderConfig>;

  constructor(public splash: Splash<{}>) {
    this.protocolParamsP = this.splash.api.getProtocolParams();
    this.transactionBuilderConfigP = this.protocolParamsP.then(
      getTransactionBuilderConfig,
    );
  }

  newTx(): TxBuilder<typeof defaultOperations & O> {
    const tasks: ReturnType<Operation<any>>[] = [];

    //@ts-ignore
    return Object.entries(defaultOperations).reduce<TxBuilder<any>>(
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
      bestTxFee: MAX_TRANSACTION_FEE.amount,
    },
  ): Promise<Transaction> {
    try {
      const { txBuilder, partialSign } =
        await this.createSignedTransactionBuilder(
          context,
          Currency.ada(bestTxFee),
        );
      if (txBuilder.body().fee() === prevTxFee) {
        return Transaction.new(
          {
            transaction: txBuilder,
            partialSign,
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
  ): Promise<{ txBuilder: SignedTxBuilder; partialSign: boolean }> {
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
    if (
      (scriptInputs.length || mints.length) &&
      !collateralSelector['uTxOs'].length
    ) {
      throw new NoCollateralError('wallet has no collateral UTxO');
    }
    if (scriptInputs.length || mints.length) {
      try {
        collaterals = collateralSelector.select(maxCollateralsValue);
      } catch (e) {
        throw new InsufficientCollateralError(
          'insufficient collateral in wallet',
        );
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
      const requiredSigners = RequiredSigners.new();
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
    mints.forEach((mint) => {
      const requiredSigners = RequiredSigners.new();
      const partialPlutusWitness = PartialPlutusWitness.new(
        PlutusScriptWitness.new_script(
          PlutusScript.from_v2(
            PlutusV2Script.from_cbor_hex(mint.plutusV2ScriptCbor),
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
    });

    transactionCandidate.outputs.forEach((output) =>
      transactionBuilder.add_output(SingleOutputBuilderResult.new(output.wasm)),
    );
    const wasmChangeAddress = Address.from_bech32(userAddress);
    const changeSelectionAlgo = Number(ChangeSelectionAlgo.Default.toString());

    if (!collaterals.length) {
      return {
        txBuilder: transactionBuilder.build(
          changeSelectionAlgo,
          wasmChangeAddress,
        ),
        partialSign: false,
      };
    }

    const txForEvaluations = transactionBuilder.build_for_evaluation(
      changeSelectionAlgo,
      wasmChangeAddress,
    );
    const txForEvaluationInputs = txForEvaluations.draft_body().inputs();
    const txForEvaluationMints = txForEvaluations.draft_body().mint()!;

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
      const redeemersToAdd = uncheckedWitnessSetBuilder.redeemers()!;

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
        Script.new_plutus_v2(
          PlutusV2Script.from_cbor_hex(mint.plutusV2ScriptCbor),
        ),
      );
    });
    return {
      txBuilder: SignedTxBuilder.new_without_data(
        transactionBuilder.build(changeSelectionAlgo, wasmChangeAddress).body(),
        txWitnessSetBuilder,
        txForEvaluations.draft_tx().is_valid(),
      ),
      partialSign: true,
    };
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
      transactionBuilder.fee_for_output(
        SingleOutputBuilderResult.new(estimatedChangeOutput.wasm),
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
