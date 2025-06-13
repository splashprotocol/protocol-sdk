import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';

export type StartSessionSuccessResponse = SafetySuccessResponse<
  'START_SESSION',
  Uint8Array
>;
