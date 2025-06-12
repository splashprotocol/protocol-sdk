import { BaseSuccessResponse } from '../../types/SuccessResponse.ts';
import { baseMessageSchemaValidator } from '../baseMessageSchemaValidator/baseMessageSchemaValidator.ts';

export const baseSuccessMessageSchemaValidator = (
  successResponse: BaseSuccessResponse<any, any>,
  invalidSchemaErrorMessage: string,
) => {
  if (successResponse.kind !== 'success') {
    throw new Error(invalidSchemaErrorMessage);
  }
  baseMessageSchemaValidator(successResponse, invalidSchemaErrorMessage);
  return true;
};
