import { Operation } from '../../types/Operation.ts';
import { TransactionCandidate } from '../../models/TransactionCandidate/TransactionCandidate.ts';
import { BasicApi } from '@splashprotocol/api';
import { HexString } from '@splashprotocol/core';

export const addRequiredSigners: Operation<
  [HexString[]],
  BasicApi,
  TransactionCandidate
> = (requiredSigners) => {
  return ({ transactionCandidate }) => {
    transactionCandidate.addRequiredSigners(requiredSigners);
    return Promise.resolve(transactionCandidate);
  };
};
