import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { DataSignature } from './DataSignature.ts';

export type SignDataRes = SafetySuccessResponse<'SIGN_DATA', DataSignature>;
