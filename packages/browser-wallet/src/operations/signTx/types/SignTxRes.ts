import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { CborHexString } from '@splashprotocol/core';

export type SignTxRes = SafetySuccessResponse<
  'SIGN_TRANSACTION',
  CborHexString
>;
