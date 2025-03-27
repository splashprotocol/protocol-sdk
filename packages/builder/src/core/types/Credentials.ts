import { HexString } from '@splashprotocol/core';

export interface Credentials {
  readonly hash: HexString;
  readonly type: 'script' | 'pubKey';
}
