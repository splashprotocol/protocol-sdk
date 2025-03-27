import { Operation } from '../../types/Operation.ts';
import {
  MetadataPart,
  TransactionCandidate,
} from '../../models/TransactionCandidate/TransactionCandidate.ts';
import { BasicApi } from '@splashprotocol/api';

export const addMetadata: Operation<
  [MetadataPart],
  BasicApi,
  TransactionCandidate
> = (metadataPart) => {
  return ({ transactionCandidate }) => {
    transactionCandidate.addMetadata(metadataPart);
    return Promise.resolve(transactionCandidate);
  };
};
