import { SafetyRequest } from '../../../common/types/Request.ts';
import { PrepareForTradingRequestPayload } from './PrepareForTradingPayload.ts';

export type PrepareForTradingReq = SafetyRequest<'PREPARE_FOR_TRADING', PrepareForTradingRequestPayload>;
