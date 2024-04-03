import { TransactionCandidate } from '../../core/models/transactionCandidate/TransactionCandidate.ts';
import { Network } from '../../core/types/Network.ts';
import { Dictionary } from '../../core/types/types.ts';
import { ApiWrapper } from '../api/ApiWrapper.ts';
import { cfmmDeposit } from './operations/cfmmDeposit/cfmmDeposit.ts';
import { Operation } from './operations/common/Operation.ts';
import { payToAddress } from './operations/payToAddress/payToAddress.ts';
import { payToContract } from './operations/payToContract/payToContract.ts';
import { spotOrder } from './operations/spotOrder/spotOrder.ts';

export const defaultOperations = {
  payToAddress,
  payToContract,
  cfmmDeposit,
  spotOrder,
};

export type TxBuilder<O extends Dictionary<Operation<any>>> = {
  [key in keyof O]: (...args: Parameters<O[key]>) => TxBuilder<O>;
} & {
  queue: ReturnType<Operation<any>>[];
  complete(): Promise<any>;
};

export class TxBuilderFactory<O extends Dictionary<Operation<any>>> {
  constructor(
    public network: Network,
    public api: ApiWrapper,
  ) {}

  newTx(): TxBuilder<typeof defaultOperations & O> {
    const that = this;
    //@ts-ignore
    return Object.entries(defaultOperations).reduce<TxBuilder<any>>(
      (acc, [name, op]) =>
        ({
          ...acc,
          [name]: function (...args: any[]) {
            return { ...this, queue: this.queue.concat(op(...args)) };
          },
        }) as any,
      {
        queue: [],
        complete(): Promise<any> {
          return Promise.all([
            Promise.resolve(TransactionCandidate.new()),
            that.api.getProtocolParams(),
          ]).then((res) => console.log(res));
          // readonly transactionCandidate: TransactionCandidate;
          // readonly pParams: ProtocolParams;
          // readonly nContext: NetworkContext;
          // readonly uTxOsSelector: UTxOsSelector;
          // readonly userAddress: Bech32String;
          // readonly network: Network;
          // readonly splash: Splash<{}>;
        },
      } as any,
    );
  }
}
