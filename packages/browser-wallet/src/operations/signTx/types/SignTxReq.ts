import { CborHexString } from '@splashprotocol/core';
import { SafetyRequest } from '../../../common/types/Request.ts';

export type SignTxReq = SafetyRequest<'SIGN_TRANSACTION', CborHexString>;
