import { SafetyRequest } from '../../../common/types/Request.ts';
import { PrepareForTradingRequestPayload } from './PrepareForTradingRequestPayload.ts';

export type PrepareForTradingReq = SafetyRequest<
  'PREPARE_FOR_TRADING',
  PrepareForTradingRequestPayload
>;
