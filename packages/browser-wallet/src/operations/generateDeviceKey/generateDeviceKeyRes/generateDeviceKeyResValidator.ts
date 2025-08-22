import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { GenerateDeviceKeyRes } from '../types/GenerateDeviceKeyRes.ts';
import { DeviceKeyResult } from '../types/DeviceKeyResult.ts';

export const generateDeviceKeyResValidator =
  createValidator<GenerateDeviceKeyRes>({
    type: 'safety-response',
    operation: 'GENERATE_DEVICE_KEY',
    isSchemaInvalid: (payload: DeviceKeyResult) => {
      if (typeof payload.storageAccess !== 'string') {
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

      if (payload.storageAccess === 'restricted') {
        if (!(payload.privateKey instanceof Uint8Array)) {
          return true;
        }
      } else if (payload.storageAccess === 'allowed') {
        if ('privateKey' in payload) {
          return true;
        }
      }

      return false;
    },
  });
