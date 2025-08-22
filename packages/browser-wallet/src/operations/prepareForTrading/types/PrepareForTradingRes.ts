import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { PrepareForTradingResult } from './PrepareForTradingResult.ts';

export type PrepareForTradingRes = SafetySuccessResponse<'PREPARE_FOR_TRADING', PrepareForTradingResult>;
