import { HexString } from '@splashprotocol/core';
import { EncryptedContainer } from './PrepareForTradingRequestPayload.ts';

export interface WalletInfo {
  readonly pk: HexString;
  readonly pkh: HexString;
  readonly skh: HexString;
}

export interface PFTRes_BasePayload {
  readonly info: WalletInfo;
}

export interface PFTRes_NewSessionPayload extends PFTRes_BasePayload {
  readonly type: 'new-session';
  readonly info: WalletInfo;
  readonly sessionContainer: EncryptedContainer;
  readonly sessionPassword: 'sandbox' | EncryptedContainer;
}

export interface PFTRes_ExistedSessionPayload {
  readonly type: 'existed-session';
  readonly info: WalletInfo;
}

export type PrepareForTradingResponsePayload =
  | PFTRes_NewSessionPayload
  | PFTRes_ExistedSessionPayload;
