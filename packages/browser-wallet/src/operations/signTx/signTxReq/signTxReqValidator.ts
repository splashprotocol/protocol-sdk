import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { SignTxReq } from '../types/SignTxReq.ts';

export const signTxReqValidator = createValidator<SignTxReq>({
  type: 'safety-request',
  operation: 'SIGN_TRANSACTION',
  isSchemaInvalid: (payload) => typeof payload !== 'string',
});
