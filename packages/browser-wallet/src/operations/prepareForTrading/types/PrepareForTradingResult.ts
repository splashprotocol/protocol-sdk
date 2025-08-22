import { HexString } from '@splashprotocol/core';

export interface PrepareForTradingResult {
  readonly pk: HexString;
  readonly pkh: HexString;
  readonly skh: HexString;
}
