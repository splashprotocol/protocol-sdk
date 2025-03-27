import { Operation } from '../../types/Operation.ts';
import { TransactionCandidate } from '../../models/TransactionCandidate/TransactionCandidate.ts';
import { BasicApi } from '@splashprotocol/api';
import { UTxO } from '../../models/UTxO/UTxO.ts';

export const selectUTxO: Operation<[UTxO], BasicApi, TransactionCandidate> = (
  uTxO,
) => {
  return ({ transactionCandidate }) => {
    transactionCandidate.addInput(uTxO);
    return Promise.resolve(transactionCandidate);
  };
};
