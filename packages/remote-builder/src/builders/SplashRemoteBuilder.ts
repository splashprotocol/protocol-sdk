import { RemoteBuilder } from '../core/types/RemoteBuilder.ts';
import { Api, SplashBackend } from '@splashprotocol/api';
import { RemoteTransaction } from '../core/models/RemoteTransaction/RemoteTransaction.ts';
import {
  CborHexString,
  OutputReference,
  OutputReferenceHash,
  TransactionHash,
} from '@splashprotocol/core';
import { SignedRemoteTransaction } from '../core/models/SignedRemoteTransaction/SignedRemoteTransaction.ts';

export class SplashRemoteBuilder
  implements RemoteBuilder<Api<SplashBackend>, CborHexString>
{
  static new(api: Api<SplashBackend>): SplashRemoteBuilder {
    return new SplashRemoteBuilder(api);
  }

  readonly api: Api<SplashBackend>;

  private constructor(api: Api<SplashBackend>) {
    this.api = api;
  }

  sign(): Promise<
    SignedRemoteTransaction<
      CborHexString,
      RemoteBuilder<Api<SplashBackend>, CborHexString>,
      any
    >
  > {
    throw new Error('not implemented.');
  }

  submit(): Promise<TransactionHash> {
    throw new Error('not implemented.');
  }

  trade(): Promise<
    RemoteTransaction<
      CborHexString,
      RemoteBuilder<Api<SplashBackend>, CborHexString>,
      any
    >
  > {
    return Promise.resolve(RemoteTransaction.new('', this, undefined));
  }

  cancelOperation(
    outputReference: OutputReference | OutputReferenceHash,
  ): Promise<
    RemoteTransaction<
      CborHexString,
      RemoteBuilder<Api<SplashBackend>, CborHexString>,
      any
    >
  > {
    console.log(outputReference);
    return Promise.resolve(RemoteTransaction.new('', this, undefined));
  }
}
