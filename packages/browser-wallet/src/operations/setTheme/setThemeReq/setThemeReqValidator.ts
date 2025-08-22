import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { SetThemeReq } from '../types/SetThemeReq.ts';
import { Theme } from '../types/Theme.ts';

export const setThemeReqValidator = createValidator<SetThemeReq>({
  type: 'safety-request',
  operation: 'SET_THEME',
  isSchemaInvalid: (payload: Theme) =>
    payload !== 'dark' && payload !== 'light',
});
