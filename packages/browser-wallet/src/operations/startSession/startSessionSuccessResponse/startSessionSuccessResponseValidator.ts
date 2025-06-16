import { StartSessionSuccessResponse } from '../types/StartSessionSuccessResponse.ts';
import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { noSessionResponseSchemaValidator } from '../../../common/validators/noSessionResponseSchemaValidator/noSessionResponseSchemaValidator.ts';
import { signatureValidator } from '../../../common/validators/signatureValidator/signatureValidator.ts';

const INVALID_SCHEMA_ERROR_MESSAGE =
  'INVALID START SESSION SUCCESS RESPONSE SCHEMA';
const startSessionSuccessSchemaValidator = (
  successResponse: StartSessionSuccessResponse,
): true => {
  noSessionResponseSchemaValidator(
    successResponse,
    INVALID_SCHEMA_ERROR_MESSAGE,
  );
  if (!(successResponse.payload instanceof Uint8Array)) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  return true;
};

export interface StartSessionSuccessResponseValidatorProps {
  readonly event: MessageEvent<StartSessionSuccessResponse>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
}
const INVALID_TYPE_ERROR_MESSAGE =
  'INVALID START SESSION SUCCESS RESPONSE SCHEMA';
export const startSessionSuccessResponseValidator = async ({
  event,
  deviceId,
  validOrigins,
  expectedSource,
}: StartSessionSuccessResponseValidatorProps): Promise<true> => {
  if (event.data.type !== 'START_SESSION') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  startSessionSuccessSchemaValidator(event.data);
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  originValidator(validOrigins, event.origin);
  sourceValidator(expectedSource, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  await signatureValidator(event.data.payload, event.data, deviceId);

  return true;
};
