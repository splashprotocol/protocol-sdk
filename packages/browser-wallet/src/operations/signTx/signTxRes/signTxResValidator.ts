import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { SignTxRes } from '../types/SignTxRes.ts';

export const signTxResValidator = createValidator<SignTxRes>({
  type: 'safety-response',
  operation: 'SIGN_TRANSACTION',
  isSchemaInvalid: (payload) => typeof payload !== 'string',
});