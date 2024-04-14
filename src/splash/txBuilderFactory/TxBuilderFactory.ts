import {
  Address,
  ChangeSelectionAlgo,
  SignedTxBuilder,
  SingleInputBuilder,
  SingleOutputBuilderResult,
  TransactionBuilder,
  TransactionBuilderConfig,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Currencies } from '../../core/models/currencies/Currencies.ts';
import { Currency } from '../../core/models/currency/Currency.ts';
import { Transaction } from '../../core/models/transaction/Transaction.ts';
import { TransactionCandidate } from '../../core/models/transactionCandidate/TransactionCandidate.ts';
import { UTxO } from '../../core/models/utxo/UTxO.ts';
import { ProtocolParams } from '../../core/types/ProtocolParams.ts';
import { Dictionary, uint } from '../../core/types/types.ts';
import { predictDepositAda } from '../../core/utils/predictDepositAdaForExecutor/predictDepositAda.ts';
import { TRANSACTION_FEE } from '../../core/utils/transactionFee/transactionFee.ts';
import { UTxOsSelector } from '../../core/utils/utxosSelector/UTxOsSelector.ts';
import { Splash } from '../splash.ts';
import { InsufficientFundsErrorForChange } from './erors/InsufficientFundsErrorForChange.ts';
import { cfmmDeposit } from './operations/cfmmDeposit/cfmmDeposit.ts';
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
  cfmmDeposit: typeof cfmmDeposit;
  spotOrder: typeof spotOrder;
} = {
  payToAddress,
  payToContract,
  cfmmDeposit,
  spotOrder,
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

    return {
      transactionCandidate,
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
      const txBuilder = await this.createSignedTransactionBuilder(context);
      if (txBuilder.body().fee() === prevTxFee) {
        return Transaction.new(
          {
            transaction: txBuilder,
            partialSign: false,
          },
          context.splash,
        );
      }
      if (buildCounts > 3) {
        return Transaction.new(
          {
            transaction:
              txBuilder.body().fee() > bestTxTxFee
                ? await this.createSignedTransactionBuilder(
                    context,
                    Currency.ada(bestTxTxFee),
                  )
                : txBuilder,
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
      ...rest
    }: OperationContext,
    txFee: Currency = TRANSACTION_FEE,
  ): Promise<SignedTxBuilder> {
    const transactionBuilder = TransactionBuilder.new(
      await this.transactionBuilderConfigP,
    );
    const totalOutputValue = transactionCandidate.outputs.reduce(
      (total, output) => total.plus(output.totalValue),
      Currencies.empty,
    );
    const uTxOsForOutput = uTxOsSelector['selectForTransactionBuilder'](
      totalOutputValue.plus([txFee]),
    );
    const fullUTxOs = this.normalizeUTxOsForChange(
      totalOutputValue,
      uTxOsForOutput,
      { transactionCandidate, uTxOsSelector, userAddress, splash, ...rest },
    );

    transactionCandidate.outputs.forEach((output) =>
      transactionBuilder.add_output(SingleOutputBuilderResult.new(output.wasm)),
    );
    fullUTxOs.forEach((uTxO) =>
      transactionBuilder.add_input(
        SingleInputBuilder.from_transaction_unspent_output(
          uTxO.wasm,
        ).payment_key(),
      ),
    );
    const wasmChangeAddress = Address.from_bech32(userAddress);
    transactionBuilder.add_change_if_needed(wasmChangeAddress, true);

    return transactionBuilder.build(
      Number(ChangeSelectionAlgo.Default.toString()),
      wasmChangeAddress,
    );
  }

  private normalizeUTxOsForChange(
    totalOutputValue: Currencies,
    uTxOsForOutput: UTxO[],
    context: OperationContext,
  ): UTxO[] {
    const estimatedChange = uTxOsForOutput
      .reduce((acc, uTxO) => acc.plus(uTxO.value), Currencies.empty)
      .minus(totalOutputValue);
    const additionalAdaForChange = predictDepositAda(context.pParams, {
      address: context.userAddress,
      value: estimatedChange,
    });

    if (!additionalAdaForChange.isPositive()) {
      return uTxOsForOutput;
    }
    let additionalUTxOs: UTxO[];

    try {
      additionalUTxOs = context.uTxOsSelector.select(
        Currencies.new([additionalAdaForChange]),
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
      context,
    );
  }
}
