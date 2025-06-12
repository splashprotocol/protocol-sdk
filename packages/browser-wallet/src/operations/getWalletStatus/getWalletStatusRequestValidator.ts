import { GetWalletStatusRequest } from './types/GetWalletStatusRequest.ts';
import { nonceValidator } from '../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../common/validators/timestampValidator/timestampValidator.ts';
import { requestIdValidator } from '../../common/validators/requestIdValidator/requestIdValidator.ts';
import { sourceValidator } from '../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { originValidator } from '../../common/validators/originValidator/originValidator.ts';
import { baseMessageSchemaValidator } from '../../common/validators/baseMessageSchemaValidator/baseMessageSchemaValidator.ts';

const INVALID_SCHEMA_ERROR_MESSAGE = 'INVALID GET STATUS REQUEST SCHEMA';
const getWalletStatusSchemaValidator = (
  request: GetWalletStatusRequest,
): true => {
  baseMessageSchemaValidator(request, INVALID_SCHEMA_ERROR_MESSAGE);
  return true;
};

const INVALID_TYPE_ERROR_MESSAGE = 'INVALID REQUEST TYPE';
export const getWalletStatusRequestValidator = (
  event: MessageEvent<GetWalletStatusRequest>,
  deviceId: string,
  validOrigins: string[],
): true => {
  if (event.data.type !== 'GET_STATUS') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  getWalletStatusSchemaValidator(event.data);
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  requestIdValidator(event.data.requestId);
  originValidator(validOrigins, event.origin);
  sourceValidator(window, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  return true;
};
