import { EncryptedContainer } from '../../operations/prepareForTrading/types/PrepareForTradingRequestPayload.ts';

interface DeviceSecretAllowed {
  readonly storageAccess: 'allowed';
  readonly fundingWalletPkh: string;
}

interface DeviceSecretRestricted {
  readonly storageAccess: 'restricted';
  readonly secret: EncryptedContainer;
  readonly fundingWalletPkh: string;
}

export type DeviceSecretResult = DeviceSecretAllowed | DeviceSecretRestricted;

const DB_NAME = 'DEVICE_KEY_DB';
const STORE_NAME = 'DEVICE_KEY_STORE';
const DEVICE_SECRET_STORAGE_KEY = 'SECRET';

const getDeviceSecretBase = async (): Promise<IDBDatabase> => {
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

export const DeviceSecretStorage = {
  async getSecret(): Promise<DeviceSecretResult | undefined> {
    const secretBase = await getDeviceSecretBase();

    return new Promise((resolve, reject) => {
      const request = secretBase
        .transaction([STORE_NAME], 'readonly')
        .objectStore(STORE_NAME)
        .get(DEVICE_SECRET_STORAGE_KEY);
      request.onsuccess = function () {
        resolve(request.result);
      };
      request.onerror = function (err) {
        reject(err);
      };
    });
  },
  async setSecret(payload: DeviceSecretResult): Promise<boolean> {
    const secretBase = await getDeviceSecretBase();

    return new Promise((resolve, reject) => {
      const request = secretBase
        .transaction([STORE_NAME], 'readwrite')
        .objectStore(STORE_NAME)
        .put({
          id: DEVICE_SECRET_STORAGE_KEY,
          storageAccess: payload.storageAccess,
          fundingWalletPk: payload.fundingWalletPkh,
          secret:
            payload.storageAccess === 'restricted' ? payload.secret : undefined,
        });
      request.onsuccess = function () {
        resolve(true);
      };
      request.onerror = function (err) {
        reject(err);
      };
    });
  },
  async removeSecret(): Promise<boolean> {
    const secretBase = await getDeviceSecretBase();

    return new Promise((resolve, reject) => {
      const request = secretBase
        .transaction([STORE_NAME], 'readwrite')
        .objectStore(STORE_NAME)
        .delete(DEVICE_SECRET_STORAGE_KEY);
      request.onsuccess = function () {
        resolve(true);
      };
      request.onerror = function (err) {
        reject(err);
      };
    });
  },
};
