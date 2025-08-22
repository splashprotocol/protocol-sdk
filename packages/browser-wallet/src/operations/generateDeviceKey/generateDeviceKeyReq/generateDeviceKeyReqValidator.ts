import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { GenerateDeviceKeyReq } from '../types/GenerateDeviceKeyReq.ts';

export const generateDeviceKeyReqValidator =
  createValidator<GenerateDeviceKeyReq>({
    type: 'safety-request',
    operation: 'GENERATE_DEVICE_KEY',
    isSchemaInvalid: (payload) => payload !== undefined,
  });
