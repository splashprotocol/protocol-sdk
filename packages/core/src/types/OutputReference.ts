import { TransactionHash } from './TransactionHash.ts';

export interface OutputReference {
  readonly txHash: TransactionHash;
  readonly index: bigint;
}
