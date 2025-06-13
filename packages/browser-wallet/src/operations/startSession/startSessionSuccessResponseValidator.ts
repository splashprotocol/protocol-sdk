import { StartSessionSuccessResponse } from './types/StartSessionSuccessResponse.ts';
import { nonceValidator } from '../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { safetyResponseSchemaValidator } from '../../common/validators/safetyResponseSchemaValidator/safetyResponseSchemaValidator.ts';

const INVALID_SCHEMA_ERROR_MESSAGE =
  'INVALID START SESSION SUCCESS RESPONSE SCHEMA';
const startSessionSuccessSchemaValidator = (
  successResponse: StartSessionSuccessResponse,
): true => {
  safetyResponseSchemaValidator(successResponse, INVALID_SCHEMA_ERROR_MESSAGE);
  if (successResponse.payload !== undefined) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  return true;
};

const INVALID_TYPE_ERROR_MESSAGE =
  'INVALID START SESSION SUCCESS RESPONSE SCHEMA';
export const startSessionSuccessResponseValidator = (
  event: MessageEvent<StartSessionSuccessResponse>,
  deviceId: string,
  validOrigins: string[],
) => {
  if (event.data.type !== 'START_SESSION') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  startSessionSuccessSchemaValidator(event.data);
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  originValidator(validOrigins, event.origin);
  sourceValidator(window, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  return true;
};
