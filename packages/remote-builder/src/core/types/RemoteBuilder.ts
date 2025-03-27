import { Api, Backend } from '@splashprotocol/api';
import { RemoteTransaction } from '../models/RemoteTransaction/RemoteTransaction.ts';
import { SignedRemoteTransaction } from '../models/SignedRemoteTransaction/SignedRemoteTransaction.ts';
import { TransactionHash } from '@splashprotocol/core';

export interface RemoteBuilder<A extends Api<Backend<{}>>, S> {
  readonly api: A;

  sign<AD>(
    tx: RemoteTransaction<S, RemoteBuilder<A, S>, AD>,
  ): Promise<SignedRemoteTransaction<S, RemoteBuilder<A, S>, AD>>;

  submit<AD>(
    signedTx: SignedRemoteTransaction<S, RemoteBuilder<A, S>, AD>,
  ): Promise<TransactionHash>;
}
