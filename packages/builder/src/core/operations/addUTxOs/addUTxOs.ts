import { Operation } from '../../types/Operation.ts';
import { CborHexString } from '@splashprotocol/core';
import { UTxO } from '../../models/UTxO/UTxO.ts';
import { TransactionCandidate } from '../../models/TransactionCandidate/TransactionCandidate.ts';
import { BasicApi } from '@splashprotocol/api';

export const addUTxOs: Operation<
  [(CborHexString | UTxO)[]],
  BasicApi,
  TransactionCandidate
> =
  (uTxOs) =>
  async ({ uTxOsSelector, C, transactionCandidate }) => {
    const normalizedUTxOs = await Promise.all(
      uTxOs.map((uTxOrCbor) => {
        return typeof uTxOrCbor === 'string'
          ? UTxO.newSync(
              {
                cbor: uTxOrCbor,
              },
              C,
            )
          : uTxOrCbor;
      }),
    );
    uTxOsSelector.addUTxOs(normalizedUTxOs);

    return transactionCandidate;
  };
