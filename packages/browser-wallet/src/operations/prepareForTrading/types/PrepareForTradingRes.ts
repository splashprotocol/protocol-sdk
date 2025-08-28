import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { PrepareForTradingResponsePayload } from './PrepareForTradingResponsePayload.ts';

export type PrepareForTradingRes = SafetySuccessResponse<
  'PREPARE_FOR_TRADING',
  PrepareForTradingResponsePayload
>;
