import { Network } from '../../core/types/Network.ts';
import { Dictionary } from '../../core/types/types.ts';
import { cfmmDeposit } from './operations/cfmmDeposit/cfmmDeposit.ts';
import { Operation } from './operations/common/Operation.ts';
import { payToAddress } from './operations/payToAddress/payToAddress.ts';
import { payToContract } from './operations/payToContract/payToContract.ts';

export const defaultOperations = {
  payToAddress,
  payToContract,
  cfmmDeposit,
};

export type TxBuilder<O extends Dictionary<Operation<any>>> = {
  [key in keyof O]: (...args: Parameters<O[key]>) => TxBuilder<O>;
} & {
  queue: ReturnType<Operation<any>>[];
  complete(): Promise<any>;
};

export class TxBuilderFactory<O extends Dictionary<Operation<any>>> {
  constructor(public network: Network) {}

  newTx(): TxBuilder<typeof defaultOperations & O> {
    //@ts-ignore
    return Object.entries(defaultOperations).reduce<TxBuilder<any>>(
      (acc, [name, op]) =>
        ({
          ...acc,
          [name]: function (...args: any[]) {
            //@ts-ignore
            return { ...this, queue: this.queue.concat(op(...args)) };
          },
        }) as any,
      {
        queue: [],
        complete(): Promise<any> {
          return Promise.resolve();
        },
      } as any,
    );
  }
}
