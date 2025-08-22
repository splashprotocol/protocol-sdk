import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { DeviceKeyResult } from './DeviceKeyResult.ts';

export type GenerateDeviceKeyRes = SafetySuccessResponse<
  'GENERATE_DEVICE_KEY',
  DeviceKeyResult
>;
