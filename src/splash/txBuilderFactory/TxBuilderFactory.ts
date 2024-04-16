import {
  Address,
  ChangeSelectionAlgo,
  Ed25519KeyHash,
  ExUnits,
  NetworkId,
  PartialPlutusWitness,
  PlutusScript,
  PlutusScriptWitness,
  PlutusV2Script,
  RedeemerTag,
  RedeemerWitnessKey,
  RequiredSigners,
  SignedTxBuilder,
  SingleInputBuilder,
  SingleOutputBuilderResult,
  TransactionBuilder,
  TransactionBuilderConfig,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Currencies } from '../../core/models/currencies/Currencies.ts';
import { Currency } from '../../core/models/currency/Currency.ts';
import { Output } from '../../core/models/output/Output.ts';
import { Transaction } from '../../core/models/transaction/Transaction.ts';
import {
  ExternalInputDescriptor,
  TransactionCandidate,
} from '../../core/models/transactionCandidate/TransactionCandidate.ts';
import { UTxO } from '../../core/models/utxo/UTxO.ts';
import { ProtocolParams } from '../../core/types/ProtocolParams.ts';
import { Dictionary, OutputReference, uint } from '../../core/types/types.ts';
import { TRANSACTION_FEE } from '../../core/utils/transactionFee/transactionFee.ts';
import { UTxOsSelector } from '../../core/utils/utxosSelector/UTxOsSelector.ts';
import { Splash } from '../splash.ts';
import { InsufficientFundsErrorForChange } from './erors/InsufficientFundsErrorForChange.ts';
import { cancelOperation } from './operations/cancelOperation/cancelOperation.ts';
import { cfmmOrWeightedDeposit } from './operations/cfmmOrWeightedDeposit/cfmmOrWeightedDeposit.ts';
import { cfmmOrWeightedRedeem } from './operations/cfmmOrWeightedRedeem/cfmmOrWeightedRedeem.ts';
import { Operation, OperationContext } from './operations/common/Operation.ts';
import { payToAddress } from './operations/payToAddress/payToAddress.ts';
import { payToContract } from './operations/payToContract/payToContract.ts';
import { spotOrder } from './operations/spotOrder/spotOrder.ts';
import { getTransactionBuilderConfig } from './utils/getTransactionBuilderConfig.ts';

interface CreateTransactionExtra {
  readonly prevTxFee?: bigint;
  readonly bestTxTxFee: bigint;
  readonly buildCounts: uint;
}

export const defaultOperations: {
  payToAddress: typeof payToAddress;
  payToContract: typeof payToContract;
  cfmmOrWeightedDeposit: typeof cfmmOrWeightedDeposit;
  cfmmOrWeightedRedeem: typeof cfmmOrWeightedRedeem;
  spotOrder: typeof spotOrder;
  cancelOperation: typeof cancelOperation;
} = {
  payToAddress,
  payToContract,
  cfmmOrWeightedDeposit,
  cfmmOrWeightedRedeem,
  spotOrder,
  cancelOperation,
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

  private async getOperationContext(): Promise<OperationContext> {
    const transactionCandidate = TransactionCandidate.new();
    const pParams = await this.protocolParamsP;
    const userAddress = await this.splash.api.getActiveAddress();
    const nContext = await this.splash.api.getNetworkContext();
    const uTxOs = await this.splash.api.getUTxOs();
    const operationsConfig = await this.splash.operationsConfig;
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
    { prevTxFee, bestTxTxFee, buildCounts }: CreateTransactionExtra = {
      prevTxFee: undefined,
      buildCounts: 1,
      bestTxTxFee: TRANSACTION_FEE.amount,
    },
  ): Promise<Transaction> {
    try {
      const { txBuilder, partialSign } =
        await this.createSignedTransactionBuilder(context);
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
              txBuilder.body().fee() > bestTxTxFee
                ? (
                    await this.createSignedTransactionBuilder(
                      context,
                      Currency.ada(bestTxTxFee),
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
        bestTxTxFee:
          txBuilder.body().fee() > bestTxTxFee
            ? bestTxTxFee
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
    txFee: Currency = TRANSACTION_FEE,
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
    const totalOutputValue = transactionCandidate.outputs.reduce(
      (total, output) => total.plus(output.totalValue),
      Currencies.new([txFee]),
    );
    const userUTxOsForOutput = scriptsInputsValue.isAssetsEnough(
      totalOutputValue,
    )
      ? []
      : uTxOsSelector['selectForTransactionBuilder'](
          totalOutputValue.minus(scriptsInputsValue),
        );
    const allUTxOs = this.normalizeUTxOsForChange(
      totalOutputValue,
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
    const collaterals = scriptInputs.length
      ? collateralSelector['uTxOs'].slice(0, rest.pParams.maxCollateralInputs)
      : [];

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

    transactionBuilder.set_network_id(
      rest.network === 'mainnet' ? NetworkId.mainnet() : NetworkId.testnet(),
    );
    collaterals.forEach((collateralUTxO) =>
      transactionBuilder.add_collateral(
        SingleInputBuilder.from_transaction_unspent_output(
          collateralUTxO.wasm,
        ).payment_key(),
      ),
    );
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
        PlutusScriptWitness.new_script(
          PlutusScript.from_v2(
            PlutusV2Script.from_cbor_hex(
              // TODO: REPLACE WITH VARIABLE
              '59041459041101000033232323232323232322222323253330093232533300b003132323300100100222533301100114a02646464a66602266ebc0380045288998028028011808801180a80118098009bab301030113011301130113011301130090011323232533300e3370e900118068008991919299980899b8748000c0400044c8c8c8c8c94ccc0594ccc05802c400852808008a503375e601860260046034603660366036603660366036603660366036602602266ebcc020c048c020c048008c020c048004c060dd6180c180c980c9808804980b80098078008b19191980080080111299980b0008a60103d87a80001323253330153375e6018602600400c266e952000330190024bd70099802002000980d001180c0009bac3007300e0063014001300c001163001300b0072301230130013322323300100100322533301200114a026464a66602266e3c008014528899802002000980b0011bae3014001375860206022602260226022602260226022602260120026eb8c040c044c044c044c044c044c044c044c044c044c044c02401cc004c0200108c03c004526136563370e900118049baa003323232533300a3370e90000008991919191919191919191919191919191919191919191919299981298140010991919191924c646600200200c44a6660560022930991980180198178011bae302d0013253330263370e9000000899191919299981698180010991924c64a66605866e1d20000011323253330313034002132498c94ccc0bccdc3a400000226464a666068606e0042649318150008b181a80098168010a99981799b87480080044c8c8c8c8c8c94ccc0e0c0ec00852616375a607200260720046eb4c0dc004c0dc008dd6981a80098168010b18168008b181900098150018a99981619b874800800454ccc0bcc0a800c5261616302a002302300316302e001302e002302c00130240091630240083253330253370e9000000899191919299981618178010a4c2c6eb4c0b4004c0b4008dd6981580098118060b1811805980d806180d0098b1bac30260013026002375c60480026048004604400260440046eb4c080004c080008c078004c078008c070004c070008dd6980d000980d0011bad30180013018002375a602c002602c004602800260280046eb8c048004c048008dd7180800098040030b1804002919299980519b87480000044c8c8c8c94ccc044c05000852616375c602400260240046eb8c040004c02000858c0200048c94ccc024cdc3a400000226464a66601c60220042930b1bae300f0013007002153330093370e900100089919299980718088010a4c2c6eb8c03c004c01c00858c01c0048c014dd5000918019baa0015734aae7555cf2ab9f5740ae855d126126d8799fd87a9f581c2be9e0e775b72db02ab618a03ccbe70c357a47bcd8437323e7e0f51affff0001',
            ),
          ),
        ),
        input.extra.redeemer,
      );
      const builder = SingleInputBuilder.from_transaction_unspent_output(
        input.uTxO.wasm,
      ).plutus_script_inline_datum(partialPlutusWitness, requiredSigners);
      transactionBuilder.add_input(builder);
    });
    transactionCandidate.outputs.forEach((output) =>
      transactionBuilder.add_output(SingleOutputBuilderResult.new(output.wasm)),
    );
    const wasmChangeAddress = Address.from_bech32(userAddress);
    const changeSelectionAlgo = Number(ChangeSelectionAlgo.Default.toString());

    if (!scriptInputs.length) {
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

    return {
      txBuilder: transactionBuilder.build(
        changeSelectionAlgo,
        wasmChangeAddress,
      ),
      partialSign: true,
    };
  }

  private normalizeUTxOsForChange(
    totalOutputValue: Currencies,
    uTxOsForOutput: UTxO[],
    transactionBuilder: TransactionBuilder,
    context: OperationContext,
  ): UTxO[] {
    const estimatedChange = uTxOsForOutput
      .reduce((acc, uTxO) => acc.plus(uTxO.value), Currencies.empty)
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
      uTxOsForOutput.concat(additionalUTxOs),
      transactionBuilder,
      context,
    );
  }
}
