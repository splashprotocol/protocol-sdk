import {
  Currencies,
  Currency,
  Dictionary,
  Network,
  TransactionHash,
} from '@splashprotocol/core';
import { Operation, OperationContext } from './types/Operation.ts';
import { BasicApi } from '@splashprotocol/api';
import { BuilderExplorer } from './types/BuilderExplorer.ts';
import { payToAddress } from './operations/payToAddress/payToAddress.ts';
import { payToContract } from './operations/payToContract/payToContract.ts';
import { mint } from './operations/mint/mint.ts';
import { addUTxOs } from './operations/addUTxOs/addUTxOs.ts';
import { addInput } from './operations/addInput/addInput.ts';
import { TransactionCandidate } from './models/TransactionCandidate/TransactionCandidate.ts';
import { ProtocolParams } from './types/ProtocolParams.ts';
import { UTxOsSelector } from './utils/UTxOsSelector/UTxOsSelector.ts';
import { CML } from './utils/Cml/Cml.ts';
import { UTxO } from './models/UTxO/UTxO.ts';
import type {
  TransactionBuilder,
  TransactionBuilderConfig,
} from '@dcspark/cardano-multiplatform-lib-browser';
import { getTransactionBuilderConfig } from './utils/getTransactionBuilderConfig/getTransactionBuilderConfig.ts';
import { Output } from './models/Output/Output.ts';
import { InsufficientFundsErrorForChange } from './errors/InsufficientFundsErrorForChange.ts';
import { SignedTransaction } from './models/SignedTransaction/SignedTransaction.ts';
import { addRequiredSigners } from './operations/addRequiredSigners/addRequiredSigners.ts';
import { selectUTxO } from './operations/selectUTxO/selectUTxO.ts';
import { BrowserWallet } from '@splashprotocol/browser-wallet';

export const defaultOperations: {
  payToAddress: typeof payToAddress;
  payToContract: typeof payToContract;
  mint: typeof mint;
  addUTxOs: typeof addUTxOs;
  addInput: typeof addInput;
  addRequiredSigners: typeof addRequiredSigners;
  selectUTxO: typeof selectUTxO;
} = {
  payToAddress,
  payToContract,
  mint,
  addUTxOs,
  addInput,
  addRequiredSigners,
  selectUTxO,
};

export type TxBuilderPipe<O extends Dictionary<Operation<any, any, any>>> = {
  [key in keyof O]: (...args: Parameters<O[key]>) => TxBuilderPipe<O>;
} & {
  tasks: ReturnType<Operation<any, any, any>>[];
  complete(): Promise<any>;
};

export class Builder<
  A extends BasicApi,
  OPS extends Dictionary<Operation<any, A, any>> | undefined,
> {
  static new<
    A extends BasicApi,
    OPS extends Dictionary<Operation<any, A, any>>,
  >(api: A, explorer: BuilderExplorer, operations?: OPS): Builder<A, OPS> {
    return new Builder<A, OPS>(api, explorer, operations);
  }

  readonly api: A;

  readonly explorer: BuilderExplorer;

  readonly network: Network;

  private protocolParamsP: Promise<ProtocolParams>;

  private transactionBuilderConfigP: Promise<TransactionBuilderConfig>;

  async sign(): Promise<SignedTransaction> {
    throw new Error('Not implemented');
  }

  async submit(): Promise<TransactionHash> {
    throw new Error('Not implemented');
  }

  newTx(): TxBuilderPipe<
    OPS extends undefined
      ? typeof defaultOperations
      : typeof defaultOperations & OPS
  > {
    const tasks: ReturnType<Operation<any, A, any>>[] = [];

    //@ts-ignore
    return Object.entries({
      ...defaultOperations,
      ...this.operations,
    }).reduce<TxBuilderPipe<any>>(
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
        complete: async (): Promise<any> => {
          const operationContext = await this.getOperationContext();
          await tasks.reduce<Promise<any>>(
            (taskChain, task) => taskChain.then(() => task(operationContext)),
            Promise.resolve(),
          );
          return this.createTransaction(operationContext);
        },
      } as TxBuilderPipe<any>,
    );
  }

  private constructor(
    api: A,
    explorer: BuilderExplorer,
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

  private async getOperationContext(): Promise<OperationContext<A>> {
    const transactionCandidate = TransactionCandidate.new();
    const pParams = await this.protocolParamsP;
    const userAddress = await this.api.getActiveAddress();
    const nContext = await this.explorer.getNetworkContext();
    const uTxOs = await this.api
      .getWalletContext()
      .then((ctx) => {
        if (ctx instanceof BrowserWallet) {
          return [];
        }
        return ctx.getUtxos();
      })
      .then((utxoCbors) => {
        if (!utxoCbors) {
          return [];
        }
        return Promise.all(
          utxoCbors.map(async (uTxOCbor) => UTxO.new({ cbor: uTxOCbor })),
        );
      });
    const uTxOsSelector = UTxOsSelector.new({
      transactionCandidate,
      uTxOs,
    });
    const collateralSelector = UTxOsSelector.new({
      uTxOs: await this.api
        .getWalletContext()
        .then((ctx) => {
          if (ctx instanceof BrowserWallet) {
            return [];
          }
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
            utxoCbors.map(async (uTxOCbor) => UTxO.new({ cbor: uTxOCbor })),
          );
        }),
    });

    return {
      transactionCandidate,
      collateralSelector,
      uTxOsSelector,
      userAddress,
      pParams,
      explorer: this.explorer,
      C: await CML,
      network: this.network,
      nContext,
      api: this.api,
    };
  }

  private async createTransaction(context: OperationContext<A>) {
    const { C, transactionCandidate, userAddress } = context;
    const builder = C.TransactionBuilder.new(
      await this.transactionBuilderConfigP,
    );
    // const cip25Metadatum = C.MetadatumMap.new();
    // const outputs = transactionCandidate.outputs;
    // const mints = transactionCandidate.mints;
    // const scriptInputs = transactionCandidate.inputs.filter(
    //   (input) => !!input.extra,
    // );

    for (let output of transactionCandidate.outputs) {
      builder.add_output(C.SingleOutputBuilderResult.new(output.wasm));
    }
    const inputs = await this.getInputs(context, builder);

    for (let input of inputs) {
      builder.add_input(
        C.SingleInputBuilder.from_transaction_unspent_output(
          input.wasm,
        ).payment_key(),
      );
    }

    const wasmChangeAddress = C.Address.from_bech32(userAddress);
    const changeSelectionAlgo = Number(
      C.ChangeSelectionAlgo.Default.toString(),
    );

    console.log(
      builder
        .build_for_evaluation(changeSelectionAlgo, wasmChangeAddress)
        .draft_tx()
        .to_json(),
    );
  }

  // add outputs
  // add
  private async getInputs(
    context: OperationContext<A>,
    builder: TransactionBuilder,
    withScripts: boolean = false,
  ): Promise<UTxO[]> {
    const feeWithoutChange = builder.min_fee(withScripts);
    const totalOutput = context.transactionCandidate.outputs
      .reduce(
        (currencies, output) => currencies.plus(output.totalValue),
        Currencies.new([Currency.ada(feeWithoutChange)]),
      )
      .minus(
        Currencies.new(
          context.transactionCandidate.mints.map((mint) => mint.asset),
        ),
      );

    const recursive = async (
      valueToSelect: Currencies,
      feeWithoutChange: bigint,
      selectedInputs: UTxO[],
      normalization: boolean = false,
    ): Promise<UTxO[]> => {
      let newInputs: UTxO[];

      try {
        newInputs = context.uTxOsSelector.select(valueToSelect, {
          exclude: selectedInputs.map((uTxO) => uTxO.ref),
        });
      } catch (error) {
        if (normalization) {
          throw new InsufficientFundsErrorForChange(
            'insufficient funds for change',
          );
        }
        throw error;
      }

      const feeForNewInputs = newInputs.reduce(
        (feeWithoutChange, uTxO) =>
          feeWithoutChange +
          builder.fee_for_input(
            context.C.SingleInputBuilder.from_transaction_unspent_output(
              uTxO.wasm,
            ).payment_key(),
          ),
        0n,
      );
      const totalInput = newInputs
        .concat(selectedInputs)
        .reduce((change, uTxO) => change.plus(uTxO.value), Currencies.empty);

      if (
        !totalInput.isAssetsEnough(
          valueToSelect.plus([Currency.ada(feeForNewInputs)]),
        )
      ) {
        return recursive(
          valueToSelect.plus([Currency.ada(feeForNewInputs)]),
          feeWithoutChange + feeForNewInputs,
          selectedInputs.concat(newInputs),
          normalization,
        );
      }
      const estimatedChangeDraft = Output.newSync(context.C, context.pParams, {
        address: context.userAddress,
        value: totalInput.minus(
          valueToSelect.plus([Currency.ada(feeForNewInputs)]),
        ),
      });
      const feeForChangeOutput = builder.fee_for_output(
        context.C.SingleOutputBuilderResult.new(estimatedChangeDraft.wasm),
      );
      const newValueToSelect = valueToSelect.plus([
        Currency.ada(feeForNewInputs),
        Currency.ada(feeForChangeOutput),
      ]);

      if (!totalInput.isAssetsEnough(newValueToSelect)) {
        return recursive(
          newValueToSelect,
          feeWithoutChange + feeForNewInputs + feeForChangeOutput,
          selectedInputs.concat(newInputs),
          true,
        );
      }
      const estimatedChange = Output.newSync(context.C, context.pParams, {
        address: context.userAddress,
        value: totalInput.minus(newValueToSelect),
      });

      if (estimatedChange.isUserValueCoverMinAdaRequired) {
        console.log('completed!');
        console.log(
          'estimatedFee:',
          feeWithoutChange + feeForNewInputs + feeForChangeOutput,
        );
        return selectedInputs.concat(newInputs);
      }
      return recursive(
        newValueToSelect.plus([
          estimatedChange.additionalAdaToCoverMinAdaRequired,
        ]),
        feeWithoutChange + feeForNewInputs + feeForChangeOutput,
        selectedInputs.concat(newInputs),
        true,
      );
    };

    return recursive(totalOutput, feeWithoutChange, []);
  }
}
