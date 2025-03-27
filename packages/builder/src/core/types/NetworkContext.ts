import { BlockHash, uint } from '@splashprotocol/core';

export interface NetworkContext {
  readonly blockHash: BlockHash;
  readonly blockId: uint;
  readonly blockNo: uint;
  readonly epochNo: uint;
  readonly slotLeader: string;
  readonly slotNo: uint;
  readonly time: string;
  readonly txCount: uint;
}
