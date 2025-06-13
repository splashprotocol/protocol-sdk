import { NoSessionRequest } from '../../types/Request.ts';
import { baseMessageSchemaValidator } from '../baseMessageSchemaValidator/baseMessageSchemaValidator.ts';

export const noSessionRequestSchemaValidator = (
  requestOrResponse: NoSessionRequest<any, any>,
  invalidSchemaErrorMessage: string,
): true => {
  baseMessageSchemaValidator(requestOrResponse, invalidSchemaErrorMessage);
  if (!(requestOrResponse.signature instanceof Uint8Array)) {
    throw new Error(invalidSchemaErrorMessage);
  }

  return true;
};
