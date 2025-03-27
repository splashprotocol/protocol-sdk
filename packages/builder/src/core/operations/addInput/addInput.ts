import { Operation } from '../../types/Operation.ts';
import { UTxO } from '../../models/UTxO/UTxO.ts';
import { CborHexString } from '@splashprotocol/core';
import {
  ScriptHashReferenceInputExtra,
  ScriptReferenceInputExtra,
  TransactionCandidate,
} from '../../models/TransactionCandidate/TransactionCandidate.ts';
import { BasicApi } from '@splashprotocol/api';

export const addInput: Operation<
  [
    UTxO | CborHexString,
    (ScriptReferenceInputExtra | ScriptHashReferenceInputExtra)?,
  ],
  BasicApi,
  TransactionCandidate
> = (uTxO, extra) => {
  return async ({ uTxOsSelector, C, transactionCandidate }) => {
    const normalizedUTxO =
      typeof uTxO === 'string' ? UTxO.newSync({ cbor: uTxO }, C) : uTxO;
    uTxOsSelector.addUTxOs([normalizedUTxO]);
    transactionCandidate.addInput(normalizedUTxO, extra);

    return Promise.resolve(transactionCandidate);
  };
};
