import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { GetExistedDevicePublicKeyRes } from '../types/GetExistedDevicePublicKeyRes.ts';

export const getExistedDevicePublicKeyResValidator =
  createValidator<GetExistedDevicePublicKeyRes>({
    type: 'safety-response',
    operation: 'GET_EXISTED_DEVICE_PUBLIC_KEY',
    isSchemaInvalid: (payload: Uint8Array | undefined) => {
      if (payload === undefined) {
        return false;
      }
      if (!(payload instanceof Uint8Array)) {
        return true;
      }
      if (payload.length === 0) {
        return true;
      }
      return false;
    },
  });
