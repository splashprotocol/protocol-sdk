import { RemoteBuilder } from '../core/types/RemoteBuilder.ts';
import { BackendEmulator } from './BackendEmulator.ts';
import { HexString, TransactionHash } from '@splashprotocol/core';
import { Api, createApi } from '@splashprotocol/api';
import { SignedRemoteTransaction } from '../core/models/SignedRemoteTransaction/SignedRemoteTransaction.ts';

export class RemoteBuilderEmulator
  implements RemoteBuilder<Api<BackendEmulator>, HexString>
{
  sign(): Promise<
    SignedRemoteTransaction<
      HexString,
      RemoteBuilder<Api<BackendEmulator>, HexString>
    >
  > {
    return Promise.resolve(SignedRemoteTransaction.new('signed', this));
  }
  submit(): Promise<TransactionHash> {
    return Promise.resolve('submitted');
  }

  constructor(public api: Api<BackendEmulator>) {}
}

const api = createApi(new BackendEmulator());
export const builderEmulator = new RemoteBuilderEmulator(api);
