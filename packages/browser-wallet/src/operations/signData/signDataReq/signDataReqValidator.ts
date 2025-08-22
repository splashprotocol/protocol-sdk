import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { SignDataReq } from '../types/SignDataReq.ts';

export const signDataReqValidator = createValidator<SignDataReq>({
  type: 'safety-request',
  operation: 'SIGN_DATA',
  isSchemaInvalid: (payload) => !(payload instanceof Uint8Array),
});
