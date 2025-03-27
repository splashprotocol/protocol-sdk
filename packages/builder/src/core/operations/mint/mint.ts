import { Operation } from '../../types/Operation.ts';
import {
  ScriptHashMintDescriptor,
  ScriptMintDescriptor,
  TransactionCandidate,
} from '../../models/TransactionCandidate/TransactionCandidate.ts';
import { BasicApi } from '@splashprotocol/api';

export const mint: Operation<
  [ScriptMintDescriptor | ScriptHashMintDescriptor],
  BasicApi,
  TransactionCandidate
> = (mintDescriptor) => {
  return ({ transactionCandidate }) => {
    transactionCandidate.addMint(mintDescriptor);

    return Promise.resolve(transactionCandidate);
  };
};
