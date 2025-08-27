export interface SeedData {
  readonly iv: Uint8Array;
  readonly salt: Uint8Array;
  readonly ciphertext: Uint8Array;
}

export interface SessionData {
  readonly iv: Uint8Array;
  readonly ciphertext: Uint8Array;
  readonly ephemeralPublicKey: Uint8Array;
}

export interface DeviceKeys {
  readonly publicKey: Uint8Array;
  readonly privateKey?: Uint8Array;
}

export interface PrepareForTradingRequestPayload {
  readonly seed?: SeedData;
  readonly session?: SessionData;
  readonly deviceKeys: 'sandbox' | DeviceKeys;
}
