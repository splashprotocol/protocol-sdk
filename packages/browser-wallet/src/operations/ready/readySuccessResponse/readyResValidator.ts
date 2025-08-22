import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { ReadyRes } from '../types/ReadyRes.ts';

export const readyResValidator = createValidator<ReadyRes>({
  type: 'base-response',
  operation: 'READY',
  isSchemaInvalid: (payload) => payload !== undefined,
});
