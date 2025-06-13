import { NoSessionResponse } from '../../../common/types/SuccessResponse.ts';

export type StartSessionSuccessResponse = NoSessionResponse<
  'START_SESSION',
  Uint8Array
>;
