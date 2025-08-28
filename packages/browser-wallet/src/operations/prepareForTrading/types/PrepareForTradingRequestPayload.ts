export interface EncryptedContainer {
  readonly ciphertext: Uint8Array;
  readonly iv: Uint8Array;
  readonly salt: Uint8Array;
}

export interface PFTReq_NoSeedPayload {
  readonly type: 'no-seed';
}

export interface PFTReq_MasterPasswordPayload {
  readonly type: 'master-password';
  readonly ciphertext: Uint8Array;
  readonly iv: Uint8Array;
  readonly salt: Uint8Array;
}

export interface PFTReq_TradingSessionPayload {
  readonly type: 'session';
  readonly masterPasswordContainer: EncryptedContainer;
  readonly sessionContainer: EncryptedContainer;
  readonly sessionPassword: 'sandbox' | EncryptedContainer;
}

export interface PFTReq_TemporaryContainerPayload {
  readonly type: 'tmp-container';
  readonly masterPasswordContainer: EncryptedContainer;
  readonly temporaryContainer: EncryptedContainer & {
    readonly temporaryPassword: string;
  };
}

export type PrepareForTradingRequestPayload =
  | PFTReq_NoSeedPayload
  | PFTReq_MasterPasswordPayload
  | PFTReq_TradingSessionPayload
  | PFTReq_TemporaryContainerPayload;
