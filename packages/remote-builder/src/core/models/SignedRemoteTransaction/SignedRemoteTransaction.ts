import { RemoteBuilder } from '../../types/RemoteBuilder.ts';
import { Api, Backend } from '@splashprotocol/api';
import { TransactionHash } from '@splashprotocol/core';

export class SignedRemoteTransaction<
  S,
  RB extends RemoteBuilder<Api<Backend<{}>>, S>,
  AdditionalData,
> {
  static new<S, RB extends RemoteBuilder<Api<Backend<{}>>, S>, AdditionalData>(
    serialization: S,
    builder: RB,
    additionalData: AdditionalData,
  ): SignedRemoteTransaction<S, RB, AdditionalData> {
    return new SignedRemoteTransaction(serialization, builder, additionalData);
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
  ) {
    this.serialization = serialization;
    this.additionalData = additionalData;
  }

  submit(): Promise<TransactionHash> {
    return this.builder.submit(this);
  }
}
