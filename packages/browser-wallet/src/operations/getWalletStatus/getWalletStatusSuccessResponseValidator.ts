import { nonceValidator } from '../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { GetWalletStatusSuccessResponse } from './types/GetWalletStatusSuccessResponse.ts';

const INVALID_SCHEMA_ERROR_MESSAGE = 'INVALID GET STATUS REQUEST SCHEMA';
const getWalletStatusSuccessSchemaValidator = (
  request: GetWalletStatusSuccessResponse,
): true => {
  if (
    !request.deviceId ||
    (request.deviceId && typeof request.deviceId !== 'string')
  ) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  if (!request.nonce || (request.nonce && typeof request.nonce !== 'string')) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  if (
    !request.timestamp ||
    (request.timestamp && typeof request.timestamp !== 'number')
  ) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  if (!request.requestId && typeof request.requestId !== 'string') {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  return true;
};

const INVALID_TYPE_ERROR_MESSAGE = 'INVALID GET STATUS RESPONSE SCHEMA';
const INVALID_KIND_ERROR_MESSAGE = 'INVALID GET STATUS RESPONSE KIND';
export const readySuccessResponseValidator = (
  event: MessageEvent<GetWalletStatusSuccessResponse>,
  deviceId: string,
  validOrigins: string[],
) => {
  if (event.data.type !== 'GET_STATUS') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  if (event.data.kind !== 'success') {
    throw new Error(INVALID_KIND_ERROR_MESSAGE);
  }
  getWalletStatusSuccessSchemaValidator(event.data);
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  originValidator(validOrigins, event.origin);
  sourceValidator(window, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  return true;
};
