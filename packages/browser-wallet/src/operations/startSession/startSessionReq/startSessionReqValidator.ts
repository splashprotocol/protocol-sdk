import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { StartSessionReq } from '../types/StartSessionReq.ts';

export const startSessionReqValidator = createValidator<StartSessionReq>({
  type: 'no-session-request',
  operation: 'START_SESSION',
  isSchemaInvalid: (payload) => !(payload instanceof Uint8Array),
  getPublicKey: (payload) => payload,
});
