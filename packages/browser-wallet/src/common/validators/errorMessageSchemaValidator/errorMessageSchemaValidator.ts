import { ErrorResponse } from '../../types/ErrorResponse.ts';
import { baseMessageSchemaValidator } from '../baseMessageSchemaValidator/baseMessageSchemaValidator.ts';

export const errorMessageSchemaValidator = (
  errorResponse: ErrorResponse<any>,
  invalidSchemaErrorMessage: string,
): true => {
  if (errorResponse.kind !== 'error') {
    throw new Error(invalidSchemaErrorMessage);
  }
  if (typeof errorResponse.message !== 'string') {
    throw new Error(invalidSchemaErrorMessage);
  }
  baseMessageSchemaValidator(errorResponse, invalidSchemaErrorMessage);
  return true;
};
