import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { StartSessionRes } from '../types/StartSessionRes.ts';

export const startSessionResValidator = createValidator<StartSessionRes>({
  type: 'no-session-response',
  operation: 'START_SESSION',
  isSchemaInvalid: (payload) => !(payload instanceof Uint8Array),
  getPublicKey: (payload) => payload,
});
