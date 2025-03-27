import { Bech32String, OutputReferenceHash } from '@splashprotocol/core';

export interface RemoteCollateral {
  readonly outputReferenceHash: OutputReferenceHash;
  readonly address: Bech32String;
}
