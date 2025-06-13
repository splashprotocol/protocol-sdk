import { StartSessionRequest } from './types/StartSessionRequest.ts';
import { nonceValidator } from '../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../common/validators/timestampValidator/timestampValidator.ts';
import { requestIdValidator } from '../../common/validators/requestIdValidator/requestIdValidator.ts';
import { originValidator } from '../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { baseMessageSchemaValidator } from '../../common/validators/baseMessageSchemaValidator/baseMessageSchemaValidator.ts';
import { signatureValidator } from '../../common/validators/signatureValidator/signatureValidator.ts';

const INVALID_SCHEMA_ERROR_MESSAGE = 'INVALID START SESSION REQUEST SCHEMA';
const startSessionRequestSchemaValidator = (
  request: StartSessionRequest,
): true => {
  baseMessageSchemaValidator(request, INVALID_SCHEMA_ERROR_MESSAGE);
  return true;
};

const INVALID_TYPE_ERROR_MESSAGE = 'INVALID START SESSION REQUEST TYPE';
export const startSessionRequestValidator = async (
  event: MessageEvent<StartSessionRequest>,
  deviceId: string,
  validOrigins: string[],
): Promise<true> => {
  if (event.data.type !== 'START_SESSION') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  startSessionRequestSchemaValidator(event.data);
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  requestIdValidator(event.data.requestId);
  originValidator(validOrigins, event.origin);
  sourceValidator(window, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  await signatureValidator(event.data.payload, event.data, deviceId);
  return true;
};
