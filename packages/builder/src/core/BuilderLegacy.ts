import {
  Bech32String,
  CborHexString,
  Currencies,
  Currency,
  Dictionary,
  HexString,
  hexToBytes,
  Network,
  OutputReference,
  TransactionHash,
  uint,
} from '@splashprotocol/core';
import { Operation, OperationContext } from './types/Operation.ts';
import {
  BasicApi,
  CardanoCIP30WalletBridge,
  CardanoCIP30WalletContext,
} from '@splashprotocol/api';
import { BuilderExplorer } from './types/BuilderExplorer.ts';
import { getTransactionBuilderConfig } from './utils/getTransactionBuilderConfig/getTransactionBuilderConfig.ts';
import { CML } from './utils/Cml/Cml.ts';
import { ProtocolParams } from './types/ProtocolParams.ts';
import type {
  SignedTxBuilder,
  TransactionBuilderConfig,
  TransactionBuilder,
  MetadatumMap,
} from '@dcspark/cardano-multiplatform-lib-browser';
import { TransactionCandidate } from './models/TransactionCandidate/TransactionCandidate.ts';
import { UTxO } from './models/UTxO/UTxO.ts';
import { UTxOsSelector } from './utils/UTxOsSelector/UTxOsSelector.ts';
import { NoCollateralError } from './errors/NoCollateralError.ts';
import { InsufficientCollateralError } from './errors/InsufficientCollateralError.ts';
import { Output } from './models/Output/Output.ts';
import { InsufficientFundsErrorForChange } from './errors/InsufficientFundsErrorForChange.ts';
import { defaultOperations } from './Builder.ts';
import { Transaction } from './models/Transaction/Transaction.ts';
import { SignedTransaction } from './models/SignedTransaction/SignedTransaction.ts';
import { RemoteCollateralsConfig } from './legacyUtils/remoteCollaterals/RemoteCollateralsConfig.ts';
import { NetworkContext } from './types/NetworkContext.ts';

export interface NewTransactionConfig {
  readonly changeAddress?: Bech32String;
  readonly specificUTxOs?: CborHexString[] | UTxO[];
  readonly specificCollaterals?: CborHexString[] | UTxO[];
  readonly disableNContext?: boolean;
}

interface CreateTransactionExtra {
  readonly prevTxFee?: bigint;
  readonly bestTxFee: bigint;
  readonly buildCounts: uint;
}

export type TxLegacyBuilderPipe<
  O extends Dictionary<Operation<any, any, any>>,
> = {
  [key in keyof O]: (...args: Parameters<O[key]>) => TxLegacyBuilderPipe<O>;
} & {
  tasks: ReturnType<Operation<any, any, any>>[];
  complete(): Promise<Transaction>;
};

export class BuilderLegacy<
  A extends BasicApi,
  OPS extends Dictionary<Operation<any, A, any>> | undefined,
> {
  readonly api: A;

  readonly explorer: BuilderExplorer;

  readonly network: Network;

  private protocolParamsP: Promise<ProtocolParams>;

  private transactionBuilderConfigP: Promise<TransactionBuilderConfig>;

  constructor(
    api: A,
    explorer: BuilderExplorer,
    private remoteCollateralsConfig: RemoteCollateralsConfig,
    private operations?: OPS,
  ) {
    if (explorer.network !== api.network) {
      throw new Error('Explorer not supported');
    }
    this.api = api;
    this.explorer = explorer;
    this.network = this.api.network;
    this.protocolParamsP = this.explorer.getProtocolParams();
    this.transactionBuilderConfigP = this.protocolParamsP.then(
      async (pParams) => getTransactionBuilderConfig(pParams, await CML),
    );
  }

  selectWallet(
    wallet:
      | undefined
      | (() => Promise<CardanoCIP30WalletContext>)
      | (() => CardanoCIP30WalletContext)
      | CardanoCIP30WalletBridge,
  ): void {
    this.api.selectWallet(wallet);
  }

  async sign(transaction: Transaction): Promise<SignedTransaction> {
    const C = await CML;

    return Promise.all([
      this.api
        .getWalletContext()
        .then((ctx) =>
          ctx.signTx(
            C.Transaction.from_cbor_hex(
              transaction.wasm.to_canonical_cbor_hex(),
            ).to_cbor_hex(),
            transaction.partialSign,
            transaction.context.uTxOsSelector['uTxOs'].concat(
              transaction.context.collateralSelector['uTxOs'],
            ),
          ),
        ),
      this.remoteCollateralsConfig && transaction.remoteCollateral
        ? this.remoteCollateralsConfig.sign(transaction)
        : Promise.resolve(undefined),
    ])

      .then(async ([witness, remoteCollateralSign]) => {
        return SignedTransaction.new({
          transaction,
          witnessSetsWithSign: remoteCollateralSign
            ? [witness, remoteCollateralSign]
            : [witness],
          C: await CML,
        });
      });
  }

  async submit(signedTransaction: SignedTransaction): Promise<TransactionHash> {
    const C = await CML;
    const wasmTx = C.Transaction.from_cbor_hex(
      signedTransaction.wasm.to_canonical_cbor_hex(),
    );

    return this.api.getWalletContext().then((ctx) => {
      return ctx.submitTx(wasmTx.to_cbor_hex());
    });
  }

  newTx(
    config?: NewTransactionConfig,
  ): TxLegacyBuilderPipe<
    OPS extends undefined
      ? typeof defaultOperations
      : typeof defaultOperations & OPS
  > {
    const tasks: ReturnType<Operation<any, A, any>>[] = [];

    //@ts-ignore
    return Object.entries({
      ...defaultOperations,
      ...this.operations,
    }).reduce<TxLegacyBuilderPipe<any>>(
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
          const operationContext = await this.getOperationContext(config);
          await tasks.reduce<Promise<any>>(
            (taskChain, task) => taskChain.then(() => task(operationContext)),
            Promise.resolve(),
          );
          // await Promise.all(tasks.map((task) => task(operationContext)));

          return this.createTransaction(operationContext);
        },
      } as TxLegacyBuilderPipe<any>,
    );
  }

  private async getOperationContext(
    config?: NewTransactionConfig,
  ): Promise<OperationContext<A>> {
    const transactionCandidate = TransactionCandidate.new();
    const C = await CML;
    const [pParams, userAddress, nContext, uTxOs, collateralUTxOs] =
      await Promise.all([
        this.protocolParamsP,
        config?.changeAddress
          ? Promise.resolve(config.changeAddress)
          : this.api.getActiveAddress(),
        config?.disableNContext
          ? (null as unknown as NetworkContext)
          : this.explorer.getNetworkContext(),
        config?.specificUTxOs
          ? Promise.resolve(
              config.specificUTxOs.map((sUTxO: UTxO | CborHexString) =>
                typeof sUTxO === 'string'
                  ? UTxO.newSync({ cbor: sUTxO }, C)
                  : sUTxO,
              ),
            )
          : this.api
              .getWalletContext()
              .then((ctx) => {
                return ctx.getUtxos();
              })
              .then((utxoCbors) => {
                if (!utxoCbors) {
                  return [];
                }
                return Promise.all(
                  utxoCbors.map(async (uTxOCbor) =>
                    UTxO.new({ cbor: uTxOCbor }),
                  ),
                );
              }),
        config?.specificCollaterals
          ? Promise.resolve(
              config.specificCollaterals.map((sUTxO: UTxO | CborHexString) =>
                typeof sUTxO === 'string'
                  ? UTxO.newSync({ cbor: sUTxO }, C)
                  : sUTxO,
              ),
            )
          : this.api
              .getWalletContext()
              .then((ctx) => {
                return ctx.getCollateral
                  ? ctx.getCollateral()
                  : ctx.experimental?.getCollateral
                    ? ctx.experimental.getCollateral()
                    : [];
              })
              .then((utxoCbors) => {
                if (!utxoCbors) {
                  return [];
                }
                return Promise.all(
                  utxoCbors.map(async (uTxOCbor) =>
                    UTxO.new({ cbor: uTxOCbor }),
                  ),
                );
              }),
      ]);

    const uTxOsSelector = UTxOsSelector.new({
      transactionCandidate,
      uTxOs,
    });
    const collateralSelector = UTxOsSelector.new({
      uTxOs: collateralUTxOs,
    });

    return {
      transactionCandidate,
      collateralSelector,
      uTxOsSelector,
      userAddress,
      pParams,
      explorer: this.explorer,
      C,
      network: this.network,
      nContext,
      api: this.api,
    };
  }

  private async createTransaction(
    context: OperationContext<A>,
    { prevTxFee, bestTxFee, buildCounts }: CreateTransactionExtra = {
      prevTxFee: undefined,
      buildCounts: 1,
      bestTxFee: context.transactionCandidate.inputs.some((i) => !!i.extra)
        ? Currency.ada(1500000n).amount
        : Currency.ada(500000n).amount,
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
            signedTxBuilder: txBuilder,
            partialSign,

            C: context.C,
            remoteCollateral,
            context: context,
            additionalData: context.transactionCandidate.additionalData,
          },
          //   @ts-ignore
          this,
        );
      }
      if (buildCounts > 3) {
        return Transaction.new(
          {
            signedTxBuilder:
              txBuilder.body().fee() > bestTxFee
                ? (
                    await this.createSignedTransactionBuilder(
                      context,
                      Currency.ada(bestTxFee),
                    )
                  ).txBuilder
                : txBuilder,
            remoteCollateral,
            partialSign,
            C: context.C,
            context: context,
            additionalData: context.transactionCandidate.additionalData,
          },
          //   @ts-ignore
          this,
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
      collateralSelector,
      C,
      ...rest
    }: OperationContext<A>,
    txFee: Currency = transactionCandidate.inputs.some((i) => !!i.extra)
      ? Currency.ada(1500000n)
      : Currency.ada(500000n),
  ): Promise<{
    txBuilder: SignedTxBuilder;
    partialSign: boolean;
    remoteCollateral: boolean;
  }> {
    const transactionBuilder = C.TransactionBuilder.new(
      await this.transactionBuilderConfigP,
    );

    if (transactionCandidate.validFrom) {
      transactionBuilder.set_validity_start_interval(
        transactionCandidate.validFrom,
      );
    }
    if (transactionCandidate.validTo) {
      transactionBuilder.set_ttl(transactionCandidate.validTo);
    }

    const scriptInputs = transactionCandidate.inputs.filter(
      (input) => !!input.extra,
    );
    const scriptsInputsValue = scriptInputs.reduce(
      (total, scriptInput) => total.plus(scriptInput.uTxO.value),
      Currencies.empty,
    );
    // const withdrawals = transactionCandidate.withdrawals;
    const mints = transactionCandidate.mints;
    const mintsInputValue = mints.reduce(
      (total, mint) => total.plus([mint.asset]),
      Currencies.empty,
    );

    const totalOutputValue = transactionCandidate.outputs.reduce(
      (total, output) => total.plus(output.totalValue),
      Currencies.new([txFee]),
    );
    const maxCollateralsValue = Currencies.new([Currency.ada(5000000n)]);
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
        collateralSelector,
        C,
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
        if (this.remoteCollateralsConfig) {
          const collaterals =
            await this.remoteCollateralsConfig.getCollaterals();
          remoteCollaterals = (
            await Promise.all(
              collaterals.map((c) => {
                const [txHash, index] = c.outputReferenceHash.split(':');
                return this.explorer
                  .getUTxOByRef({
                    txHash,
                    index: BigInt(index),
                  })
                  .then((uTxO) => ({
                    uTxO: uTxO!,
                    requiredSigner: C.Address.from_bech32(c.address)
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
        //   @ts-ignore
        .map((si) => si.extra.uTxORef)
        .reduce<Dictionary<OutputReference>>(
          (dict, ref) => ({
            ...dict,
            [`${ref.txHash}:${ref.index}`]: ref,
          }),
          {},
        ),
    );
    const allRefUTxOs = (await Promise.all(
      allRefUTxOsInfo.map((ref) => this.explorer.getUTxOByRef(ref)),
    )) as UTxO[];
    if (allRefUTxOs.some((refUTxO) => !refUTxO)) {
      // TODO: ADD CUSTOM ERROR
      throw new Error('some of ref uTxO not found');
    }

    collaterals.forEach((collateralUTxO) =>
      transactionBuilder.add_collateral(
        C.SingleInputBuilder.from_transaction_unspent_output(
          collateralUTxO.wasm,
        ).payment_key(),
      ),
    );
    remoteCollaterals.forEach(({ uTxO, requiredSigner }) => {
      transactionBuilder.add_collateral(
        C.SingleInputBuilder.from_transaction_unspent_output(
          uTxO.wasm,
        ).payment_key(),
      );
      transactionBuilder.add_required_signer(
        C.Ed25519KeyHash.from_hex(requiredSigner),
      );
    });
    if (collaterals.length) {
      const collateralReturnOutput = Output.newSync(C, rest.pParams, {
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
        C.SingleInputBuilder.from_transaction_unspent_output(
          uTxO.wasm,
        ).payment_key(),
      ),
    );
    scriptInputs.forEach((input) => {
      const requiredSigners = C.Ed25519KeyHashList.new();
      input.extra!.requiredSigners!.forEach((rs) =>
        requiredSigners.add(C.Ed25519KeyHash.from_hex(rs)),
      );
      const partialPlutusWitness = C.PartialPlutusWitness.new(
        // PlutusScriptWitness.new_ref(ScriptHash.from_hex(input.extra.script)),
        C.PlutusScriptWitness.new_script(
          C.PlutusScript.from_v2(
            //   @ts-ignore
            C.PlutusV2Script.from_cbor_hex(input.extra.script),
          ),
        ),
        // @ts-ignore
        C.PlutusData.from_cbor_hex(input.extra.redeemer),
      );
      const builder = C.SingleInputBuilder.from_transaction_unspent_output(
        input.uTxO.wasm,
      ).plutus_script_inline_datum(partialPlutusWitness, requiredSigners);
      transactionBuilder.add_input(builder);
    });

    const mintsMetadatumMap: MetadatumMap = C.MetadatumMap.new();
    mints
      .slice()
      .sort((a, b) => {
        const result = a.asset.asset.policyId.localeCompare(
          b.asset.asset.policyId,
        );

        if (result !== 0) {
          return result;
        }
        return a.asset.asset.nameBase16.localeCompare(b.asset.asset.nameBase16);
      })
      .forEach((mint) => {
        const requiredSigners = C.Ed25519KeyHashList.new();
        const partialPlutusWitness = C.PartialPlutusWitness.new(
          C.PlutusScriptWitness.new_script(
            //   @ts-ignore
            mint.type === 'plutusV3'
              ? C.PlutusScript.from_v3(
                  //   @ts-ignore
                  C.PlutusV3Script.from_cbor_hex(mint.script),
                )
              : C.PlutusScript.from_v2(
                  //   @ts-ignore
                  C.PlutusV2Script.from_cbor_hex(mint.script),
                ),
          ),
          C.PlutusData.from_cbor_hex(mint.redeemer!),
        );
        transactionBuilder.add_mint(
          C.SingleMintBuilder.new_single_asset(
            C.AssetName.from_cbor_hex(mint.asset.asset.nameCbor),
            mint.asset.amount,
          ).plutus_script(partialPlutusWitness, requiredSigners),
        );
        if (mint.cip25) {
          const metadatumMap = C.MetadatumMap.new();
          metadatumMap.set(
            C.TransactionMetadatum.new_text('name'),
            C.TransactionMetadatum.new_text(mint.cip25.name),
          );

          if (mint.cip25.image.length > 64) {
            const imageList = C.MetadatumList.new();
            imageList.add(C.TransactionMetadatum.new_text('ipfs://'));
            imageList.add(
              C.TransactionMetadatum.new_text(
                mint.cip25.image.split('ipfs://')[1],
              ),
            );
            metadatumMap.set(
              C.TransactionMetadatum.new_text('image'),
              C.TransactionMetadatum.new_list(imageList),
            );
          } else {
            metadatumMap.set(
              C.TransactionMetadatum.new_text('image'),
              C.TransactionMetadatum.new_text(mint.cip25.image),
            );
          }
          if (mint.cip25.ticker) {
            metadatumMap.set(
              C.TransactionMetadatum.new_text('ticker'),
              C.TransactionMetadatum.new_text(mint.cip25.ticker),
            );
          }
          if (mint.cip25.socials) {
            const socialsMap = C.MetadatumMap.new();

            if (mint.cip25.socials.discord) {
              socialsMap.set(
                C.TransactionMetadatum.new_text('discord'),
                C.TransactionMetadatum.new_text(mint.cip25.socials.discord),
              );
            }
            if (mint.cip25.socials.twitter) {
              socialsMap.set(
                C.TransactionMetadatum.new_text('twitter'),
                C.TransactionMetadatum.new_text(mint.cip25.socials.twitter),
              );
            }
            if (mint.cip25.socials.website) {
              socialsMap.set(
                C.TransactionMetadatum.new_text('website'),
                C.TransactionMetadatum.new_text(mint.cip25.socials.website),
              );
            }
            if (mint.cip25.socials.telegram) {
              socialsMap.set(
                C.TransactionMetadatum.new_text('telegram'),
                C.TransactionMetadatum.new_text(mint.cip25.socials.telegram),
              );
            }

            metadatumMap.set(
              C.TransactionMetadatum.new_text('socials'),
              C.TransactionMetadatum.new_map(socialsMap),
            );
          }
          metadatumMap.set(
            C.TransactionMetadatum.new_text('poolAuthor'),
            C.TransactionMetadatum.new_text(mint.cip25.poolAuthor),
          );

          const descriptionChunks =
            mint.cip25.description.match(/.{1,64}/g) || [];
          const descriptionList = C.MetadatumList.new();
          descriptionChunks.forEach((chunk) =>
            descriptionList.add(C.TransactionMetadatum.new_text(chunk)),
          );

          metadatumMap.set(
            C.TransactionMetadatum.new_text('description'),
            descriptionChunks.length > 1
              ? C.TransactionMetadatum.new_list(descriptionList)
              : C.TransactionMetadatum.new_text(mint.cip25.description),
          );

          const cip25Metadatum = C.MetadatumMap.new();
          cip25Metadatum.set(
            C.TransactionMetadatum.new_text(mint.cip25.name),
            C.TransactionMetadatum.new_map(metadatumMap),
          );
          mintsMetadatumMap.set(
            C.TransactionMetadatum.new_text(mint.asset.asset.policyId),
            C.TransactionMetadatum.new_map(cip25Metadatum),
          );
        }
      });
    if (mintsMetadatumMap.len() || transactionCandidate.metadata.length) {
      const finalMetadata = C.Metadata.new();

      transactionCandidate.metadata.forEach((metadataItem) => {
        if (typeof metadataItem.data === 'string') {
          const metadataChunks = metadataItem.data.match(/.{1,64}/g) || [];
          const metadataList = C.MetadatumList.new();
          metadataChunks.forEach((chunk) =>
            metadataList.add(
              C.TransactionMetadatum.new_bytes(hexToBytes(chunk)),
            ),
          );
          finalMetadata.set(
            metadataItem.label,
            metadataChunks.length > 1
              ? C.TransactionMetadatum.new_list(metadataList)
              : C.TransactionMetadatum.new_text(metadataItem.data),
          );
        } else {
          finalMetadata.set(
            metadataItem.label,
            C.TransactionMetadatum.new_int(C.Int.new(metadataItem.data as any)),
          );
        }
      });

      if (mintsMetadatumMap.len()) {
        finalMetadata.set(
          721n,
          C.TransactionMetadatum.new_map(mintsMetadatumMap),
        );
      }

      transactionBuilder.set_auxiliary_data(
        C.AuxiliaryData.new_shelley(finalMetadata),
      );
    }
    // withdrawals.forEach((withdrawal) => {
    //   const requiredSigners = C.Ed25519KeyHashList.new();
    //   const partialPlutusWitness = C.PartialPlutusWitness.new(
    //     C.PlutusScriptWitness.new_script(
    //       C.PlutusScript.from_v2(
    //         C.PlutusV2Script.from_cbor_hex(withdrawal.plutusV2ScriptCbor),
    //       ),
    //     ),
    //     withdrawal.redeemer,
    //   );
    //   transactionBuilder.add_withdrawal(
    //     C.SingleWithdrawalBuilder.new(
    //       C.RewardAddress.from_address(
    //         C.Address.from_bech32(withdrawal.rewardAddress),
    //       )!,
    //       withdrawal.amount,
    //     ).plutus_script(partialPlutusWitness, requiredSigners),
    //   );
    // });

    transactionCandidate.outputs.forEach((output) =>
      transactionBuilder.add_output(
        C.SingleOutputBuilderResult.new(output.wasm),
      ),
    );

    transactionCandidate.requiredSigners.forEach((requiredSigners) =>
      transactionBuilder.add_required_signer(
        C.Ed25519KeyHash.from_hex(requiredSigners),
      ),
    );

    const wasmChangeAddress = C.Address.from_bech32(userAddress);
    const changeSelectionAlgo = Number(
      C.ChangeSelectionAlgo.Default.toString(),
    );

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
    // const txForEvaluationWithdrawals = txForEvaluations
    //   .draft_body()
    //   .withdrawals()!;

    // withdrawals.forEach((withdrawal) => {
    //   let withdrawalIndex = 0n;
    //   for (let i = 0; i < txForEvaluationWithdrawals.keys().len(); i++) {
    //     const rewardAddress = txForEvaluationWithdrawals
    //       .keys()
    //       .get(i)
    //       .to_address()
    //       .to_bech32();
    //
    //     if (rewardAddress === withdrawal.rewardAddress) {
    //       withdrawalIndex = BigInt(i);
    //       break;
    //     }
    //   }
    //   transactionBuilder.set_exunits(
    //     C.RedeemerWitnessKey.new(C.RedeemerTag.Reward, withdrawalIndex),
    //     C.ExUnits.new(withdrawal.exUnits.mem, withdrawal.exUnits.steps),
    //   );
    // });
    mints.forEach((mint) => {
      let mintIndex = 0n;
      for (let i = 0; i < txForEvaluationMints.keys().len(); i++) {
        const policyId = txForEvaluationMints.keys().get(i).to_hex();

        if (policyId === mint.asset.asset.policyId) {
          mintIndex = BigInt(i);
          break;
        }
      }
      transactionBuilder.set_exunits(
        C.RedeemerWitnessKey.new(C.RedeemerTag.Mint, mintIndex),
        C.ExUnits.new(mint.exUnits!.mem, mint.exUnits!.steps),
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
        C.RedeemerWitnessKey.new(C.RedeemerTag.Spend, txInputIndex),
        C.ExUnits.new(
          scriptInput.extra!.exUnits!.mem,
          scriptInput.extra!.exUnits!.steps,
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
    const txWitnessSetBuilder = C.TransactionWitnessSetBuilder.new();

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
        // @ts-ignore
        mint.type === 'plutusV3'
          ? C.Script.new_plutus_v3(
              //   @ts-ignore
              C.PlutusV3Script.from_cbor_hex(mint.script),
            )
          : C.Script.new_plutus_v2(
              //   @ts-ignore
              C.PlutusV2Script.from_cbor_hex(mint.script),
            ),
      );
    });
    // withdrawals.forEach((withdrawal) => {
    //   txWitnessSetBuilder.add_script(
    //     C.Script.new_plutus_v2(
    //       C.PlutusV2Script.from_cbor_hex(withdrawal.plutusV2ScriptCbor),
    //     ),
    //   );
    // });

    if (txForEvaluations.auxiliary_data()) {
      return {
        txBuilder: C.SignedTxBuilder.new_with_data(
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
        txBuilder: C.SignedTxBuilder.new_without_data(
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
    context: OperationContext<A>,
  ): UTxO[] {
    const estimatedChange = uTxOsForOutput
      .reduce((acc, uTxO) => acc.plus(uTxO.value), Currencies.empty)
      .plus(mintsInputValue)
      .minus(totalOutputValue);
    const estimatedChangeOutput = Output.newSync(context.C, context.pParams, {
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
