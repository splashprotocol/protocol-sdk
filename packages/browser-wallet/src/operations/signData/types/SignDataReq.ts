import { SafetyRequest } from '../../../common/types/Request.ts';

export type SignDataReq = SafetyRequest<'SIGN_DATA', Uint8Array>;
