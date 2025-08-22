import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { SetThemeRes } from '../types/SetThemeRes.ts';

export const setThemeResValidator = createValidator<SetThemeRes>({
  type: 'safety-response',
  operation: 'SET_THEME',
  isSchemaInvalid: (payload) => payload !== undefined,
});
