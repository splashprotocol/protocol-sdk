import { BaseSuccessResponse } from '../../types/SuccessResponse.ts';
import { ErrorResponse } from '../../types/ErrorResponse.ts';
import { BaseRequest } from '../../types/Request.ts';
import { isWalletOperation } from '../../utils/isWalletOperation/isWalletOperation.ts';

export const baseMessageSchemaValidator = (
  requestOrResponse:
    | BaseSuccessResponse<any, any>
    | ErrorResponse<any>
    | BaseRequest<any, any>,
  invalidSchemaErrorMessage: string,
): true => {
  if (
    !requestOrResponse.deviceId ||
    (requestOrResponse.deviceId &&
      typeof requestOrResponse.deviceId !== 'string')
  ) {
    throw new Error(invalidSchemaErrorMessage);
  }
  if (
    !requestOrResponse.nonce ||
    (requestOrResponse.nonce && typeof requestOrResponse.nonce !== 'string')
  ) {
    throw new Error(invalidSchemaErrorMessage);
  }
  if (
    !requestOrResponse.timestamp ||
    (requestOrResponse.timestamp &&
      typeof requestOrResponse.timestamp !== 'number')
  ) {
    throw new Error(invalidSchemaErrorMessage);
  }
  if (
    !requestOrResponse.requestId ||
    typeof requestOrResponse.requestId !== 'string'
  ) {
    throw new Error(invalidSchemaErrorMessage);
  }
  if (!isWalletOperation(requestOrResponse)) {
    throw new Error(invalidSchemaErrorMessage);
  }

  return true;
};
