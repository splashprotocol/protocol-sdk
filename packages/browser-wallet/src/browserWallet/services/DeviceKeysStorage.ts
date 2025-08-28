// Types moved inline after removing generateDeviceKey operation

interface DeviceKeyAllowed {
  readonly storageAccess: 'allowed';
  readonly publicKey: Uint8Array;
}

interface DeviceKeyRestricted {
  readonly storageAccess: 'restricted';
  readonly publicKey: Uint8Array;
  readonly privateKey: Uint8Array;
}

export type DeviceKeyResult = DeviceKeyAllowed | DeviceKeyRestricted;

const DB_NAME = 'DEVICE_KEY_DB';
const STORE_NAME = 'DEVICE_KEY_STORE';
const DEVICE_PUBLIC_KEY_STORAGE_KEY = 'SEED_PHRASE';
const DEVICE_PRIVATE_KEY_STORAGE_KEY = 'SEED_PHRASE';

const getDeviceKeyBaseBase = async (): Promise<IDBDatabase> => {
  return new Promise((resolve) => {
    const dataBaseRequest = indexedDB.open(DB_NAME, 1);
    dataBaseRequest.onsuccess = () => {
      resolve(dataBaseRequest.result);
    };
    dataBaseRequest.onupgradeneeded = (e) => {
      (e.currentTarget! as any).result.createObjectStore(STORE_NAME, {
        keyPath: 'id',
      });
    };
  });
};

export type DevicePublicKeyStorageResult =
  | (Omit<DeviceKeyAllowed, 'publicKey'> & { publicKey: Uint8Array })
  | (Omit<DeviceKeyRestricted, 'privateKey'> & { publicKey: Uint8Array })
  | undefined;

export type DevicePrivateKeyStorageResult =
  | DeviceKeyRestricted['privateKey']
  | undefined;

export const DeviceKeyStorage = {
  async getPublicKey(): Promise<DevicePublicKeyStorageResult> {
    const seedBase = await getDeviceKeyBaseBase();

    return new Promise((resolve, reject) => {
      const request = seedBase
        .transaction([STORE_NAME], 'readonly')
        .objectStore(STORE_NAME)
        .get(DEVICE_PUBLIC_KEY_STORAGE_KEY);
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function (err) {
        reject(err);
      };
    });
  },
  async getPrivateKey(): Promise<DevicePrivateKeyStorageResult> {
    const seedBase = await getDeviceKeyBaseBase();

    return new Promise((resolve, reject) => {
      const request = seedBase
        .transaction([STORE_NAME], 'readonly')
        .objectStore(STORE_NAME)
        .get(DEVICE_PRIVATE_KEY_STORAGE_KEY);
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function (err) {
        reject(err);
      };
    });
  },
  async saveKeyData(payload: DeviceKeyResult): Promise<boolean> {
    const seedBase = await getDeviceKeyBaseBase();

    const publicKeySaveRequest = new Promise((resolve, reject) => {
      const request = seedBase
        .transaction([STORE_NAME], 'readwrite')
        .objectStore(STORE_NAME)
        .put({
          id: DEVICE_PUBLIC_KEY_STORAGE_KEY,
          storageAccess: payload.storageAccess,
          publicKey:
            payload.storageAccess === 'restricted'
              ? payload.publicKey
              : undefined,
        });
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function (err) {
        reject(err);
      };
    });

    const privateKeySaveRequest =
      payload.storageAccess === 'restricted'
        ? new Promise((resolve, reject) => {
            const request = seedBase
              .transaction([STORE_NAME], 'readwrite')
              .objectStore(STORE_NAME)
              .put({
                id: DEVICE_PRIVATE_KEY_STORAGE_KEY,
                ...payload.privateKey,
              });
            request.onsuccess = function () {
              resolve(request.result);
            };
            request.onerror = function (err) {
              reject(err);
            };
          })
        : Promise.resolve();

    return Promise.all([publicKeySaveRequest, privateKeySaveRequest]).then(
      () => true,
    );
  },
};
