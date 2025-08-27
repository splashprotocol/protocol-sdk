import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { GenerateDeviceKeyRes } from '../types/GenerateDeviceKeyRes.ts';
import { DeviceKeyResult } from '../types/DeviceKeyResult.ts';

export const generateDeviceKeyResValidator =
  createValidator<GenerateDeviceKeyRes>({
    type: 'safety-response',
    operation: 'GENERATE_DEVICE_KEY',
    isSchemaInvalid: (payload: DeviceKeyResult) => {
      if (!payload) {
        return true;
      }
      if (
        payload.storageAccess !== 'allowed' &&
        payload.storageAccess !== 'restricted'
      ) {
        return true;
      }
      if (!(payload.publicKey instanceof Uint8Array)) {
        return true;
      }

      switch (payload.storageAccess) {
        case 'allowed':
          return 'privateKey' in payload;
        case 'restricted':
          const privateKey = payload.privateKey;
          return !(
            privateKey &&
            typeof privateKey === 'object' &&
            privateKey.iv instanceof Uint8Array &&
            privateKey.salt instanceof Uint8Array &&
            privateKey.ciphertext instanceof Uint8Array
          );
      }
    },
  });
