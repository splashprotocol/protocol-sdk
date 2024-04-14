import {
  Address,
  ChangeSelectionAlgo,
  SingleInputBuilder,
  SingleOutputBuilderResult,
  TransactionBuilder,
  TransactionBuilderConfig,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Currencies } from '../../core/models/currencies/Currencies.ts';
import { Transaction } from '../../core/models/transaction/Transaction.ts';
import { TransactionCandidate } from '../../core/models/transactionCandidate/TransactionCandidate.ts';
import { ProtocolParams } from '../../core/types/ProtocolParams.ts';
import { SplashOperationsConfig } from '../../core/types/SplashOperationsConfig.ts';
import { Dictionary } from '../../core/types/types.ts';
import { UTxOsSelector } from '../../core/utils/utxosSelector/UTxOsSelector.ts';
import { Splash } from '../splash.ts';
import { cfmmDeposit } from './operations/cfmmDeposit/cfmmDeposit.ts';
import { Operation, OperationContext } from './operations/common/Operation.ts';
import { payToAddress } from './operations/payToAddress/payToAddress.ts';
import { payToContract } from './operations/payToContract/payToContract.ts';
import { spotOrder } from './operations/spotOrder/spotOrder.ts';
import { getTransactionBuilderConfig } from './utils/getTransactionBuilderConfig.ts';

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

  constructor(
    public splash: Splash<{}>,
    private operationsConfigP: Promise<SplashOperationsConfig>,
  ) {
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
    const operationsConfig = await this.operationsConfigP;
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
      network: this.splash.network,
      nContext,
      splash: this.splash,
    };
  }

  private async createTransaction({
    transactionCandidate,
    uTxOsSelector,
    userAddress,
    splash,
  }: OperationContext) {
    const transactionBuilder = TransactionBuilder.new(
      await this.transactionBuilderConfigP,
    );
    const totalOutputValue = transactionCandidate.outputs.reduce(
      (total, output) => total.plus(output.totalValue),
      Currencies.empty,
    );
    const uTxOs =
      uTxOsSelector['selectForTransactionBuilder'](totalOutputValue);

    transactionCandidate.outputs.forEach((output) =>
      transactionBuilder.add_output(SingleOutputBuilderResult.new(output.wasm)),
    );
    uTxOs.forEach((uTxO) =>
      transactionBuilder.add_input(
        SingleInputBuilder.from_transaction_unspent_output(
          uTxO.wasm,
        ).payment_key(),
      ),
    );
    const wasmChangeAddress = Address.from_bech32(userAddress);
    transactionBuilder.add_change_if_needed(wasmChangeAddress, true);

    return Transaction.new(
      {
        transaction: transactionBuilder.build(
          Number(ChangeSelectionAlgo.Default.toString()),
          wasmChangeAddress,
        ),
        partialSign: false,
      },
      splash,
    );
  }
}
