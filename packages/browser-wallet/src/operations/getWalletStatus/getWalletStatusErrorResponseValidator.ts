import { nonceValidator } from '../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { GetWalletStatusErrorResponse } from './types/GetWalletStatusErrorResponse.ts';
import { errorMessageSchemaValidator } from '../../common/validators/errorMessageSchemaValidator/errorMessageSchemaValidator.ts';

const INVALID_SCHEMA_ERROR_MESSAGE = 'INVALID GET STATUS ERROR RESPONSE SCHEMA';
const getWalletStatusErrorSchemaValidator = (
  errorResponse: GetWalletStatusErrorResponse,
): true => {
  errorMessageSchemaValidator(errorResponse, INVALID_SCHEMA_ERROR_MESSAGE);

  return true;
};

const INVALID_TYPE_ERROR_MESSAGE = 'INVALID GET STATUS RESPONSE SCHEMA';
export const getWalletStatusErrorResponseValidator = (
  event: MessageEvent<GetWalletStatusErrorResponse>,
  deviceId: string,
  validOrigins: string[],
) => {
  if (event.data.type !== 'GET_STATUS') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  getWalletStatusErrorSchemaValidator(event.data);
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  originValidator(validOrigins, event.origin);
  sourceValidator(window, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  return true;
};
