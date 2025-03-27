import { RemoteBuilder } from '../../types/RemoteBuilder.ts';
import { Api, Backend } from '@splashprotocol/api';
import { SignedRemoteTransaction } from '../SignedRemoteTransaction/SignedRemoteTransaction.ts';
import { TransactionHash } from '@splashprotocol/core';

/**
 * Remote transaction representation
 */
export class RemoteTransaction<
  S,
  RB extends RemoteBuilder<Api<Backend<{}>>, S>,
  AdditionalData,
> {
  static new<S, RB extends RemoteBuilder<Api<Backend<{}>>, S>, AdditionalData>(
    serialization: S,
    builder: RB,
    additionalData: AdditionalData,
    partial?: boolean,
  ): RemoteTransaction<S, RB, AdditionalData> {
    return new RemoteTransaction(
      serialization,
      builder,
      additionalData,
      partial,
    );
  }

  /**
   * Transaction serialization
   * @type {S}
   */
  readonly serialization: S;

  /**
   * Transaction additional data
   */
  readonly additionalData: AdditionalData;

  private constructor(
    serialization: S,
    private builder: RB,
    additionalData: AdditionalData,
    public readonly partial?: boolean,
  ) {
    this.serialization = serialization;
    this.additionalData = additionalData;
  }

  sign(): Promise<SignedRemoteTransaction<S, RB, AdditionalData>> {
    return this.builder.sign(this) as any;
  }

  signAndSubmit(): Promise<TransactionHash> {
    return this.sign().then((srt) => srt.submit());
  }
}
