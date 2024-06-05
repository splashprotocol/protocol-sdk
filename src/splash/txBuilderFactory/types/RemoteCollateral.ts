import {
  Bech32String,
  OutputReferenceHash,
} from '../../../core/types/types.ts';

export interface RemoteCollateral {
  readonly outputReferenceHash: OutputReferenceHash;
  readonly address: Bech32String;
}
