import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { GetExistedDevicePublicKeyReq } from '../types/GetExistedDevicePublicKeyReq.ts';

export const getExistedDevicePublicKeyReqValidator =
  createValidator<GetExistedDevicePublicKeyReq>({
    type: 'safety-request',
    operation: 'GET_EXISTED_DEVICE_PUBLIC_KEY',
    isSchemaInvalid: (payload) => payload !== undefined,
  });
