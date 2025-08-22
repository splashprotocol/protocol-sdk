import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { SignDataRes } from '../types/SignDataRes.ts';
import { DataSignature } from '../types/DataSignature.ts';

export const signDataResValidator = createValidator<SignDataRes>({
  type: 'safety-response',
  operation: 'SIGN_DATA',
  isSchemaInvalid: (payload: DataSignature) => {
    return !payload || 
           typeof payload.signature !== 'string' || 
           typeof payload.publicKey !== 'string';
  },
});