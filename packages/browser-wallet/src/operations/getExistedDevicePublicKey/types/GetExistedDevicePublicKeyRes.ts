import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';

export type GetExistedDevicePublicKeyRes = SafetySuccessResponse<
  'GET_EXISTED_DEVICE_PUBLIC_KEY',
  Uint8Array | undefined
>;
