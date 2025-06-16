import { ReadyResponse } from '../types/ReadyResponse.ts';
import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { baseSuccessMessageSchemaValidator } from '../../../common/validators/baseSuccessMessageSchemaValidator/baseSuccessMessageSchemaValidator.ts';

const INVALID_SCHEMA_ERROR_MESSAGE = 'INVALID READY RESPONSE SCHEMA';
const readySuccessSchemaValidator = (successResponse: ReadyResponse): true => {
  baseSuccessMessageSchemaValidator(
    successResponse,
    INVALID_SCHEMA_ERROR_MESSAGE,
  );
  if (successResponse.payload !== undefined) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  return true;
};

export interface ReadySuccessResponseValidatorProps {
  readonly event: MessageEvent<ReadyResponse>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
}
const INVALID_TYPE_ERROR_MESSAGE = 'INVALID READY RESPONSE SCHEMA';
export const readySuccessResponseValidator = async ({
  expectedSource,
  validOrigins,
  deviceId,
  event,
}: ReadySuccessResponseValidatorProps): Promise<true> => {
  if (event.data.type !== 'READY') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  readySuccessSchemaValidator(event.data);
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  originValidator(validOrigins, event.origin);
  sourceValidator(expectedSource, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  return true;
};
