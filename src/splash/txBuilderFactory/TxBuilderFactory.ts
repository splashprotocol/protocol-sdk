import { Network } from '../../core/types/Network.ts';
import { Dictionary } from '../../core/types/types.ts';
import { Operation } from './operations/common/Operation.ts';
import { payToAddress } from './operations/payToAddress/payToAddress.ts';
import { payToContract } from './operations/payToContract/payToContract.ts';

export const defaultOperations = {
  payToAddress,
  payToContract,
};

export type TxBuilder<O extends Dictionary<Operation<any>>> = {
  [key in keyof O]: (...args: Parameters<O[key]>) => TxBuilder<O>;
} & {
  complete(): Promise<any>;
};

export class TxBuilderFactory<O extends Dictionary<Operation<any>>> {
  constructor(private network: Network) {}

  newTx(): TxBuilder<typeof defaultOperations & O> {
    //@ts-ignore
    return {
      complete(): Promise<any> {
        return Promise.resolve();
      },
    };
  }
}
