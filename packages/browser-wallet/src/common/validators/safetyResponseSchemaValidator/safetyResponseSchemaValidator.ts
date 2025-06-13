import { SafetySuccessResponse } from '../../types/SuccessResponse.ts';
import { baseSuccessMessageSchemaValidator } from '../baseSuccessMessageSchemaValidator/baseSuccessMessageSchemaValidator.ts';

export const safetyResponseSchemaValidator = (
  safetyResponse: SafetySuccessResponse<any, any>,
  invalidSchemaErrorMessage: string,
) => {
  baseSuccessMessageSchemaValidator(safetyResponse, invalidSchemaErrorMessage);
  if (!(safetyResponse.signature instanceof Uint8Array)) {
    throw new Error(invalidSchemaErrorMessage);
  }
  if (typeof safetyResponse.sessionId !== 'string') {
    throw new Error(invalidSchemaErrorMessage);
  }
  return true;
};
