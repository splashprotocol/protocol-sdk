export interface DeviceKeyAllowed {
  readonly storageAccess: 'allowed';
  readonly publicKey: Uint8Array;
}

export interface DeviceKeyRestricted {
  readonly storageAccess: 'restricted';
  readonly publicKey: Uint8Array;
  readonly privateKey: Uint8Array;
}

export type DeviceKeyResult = DeviceKeyAllowed | DeviceKeyRestricted;
