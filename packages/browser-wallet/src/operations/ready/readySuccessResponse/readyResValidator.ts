import { ReadyRes } from '../types/ReadyRes.ts';
import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { baseSuccessMessageSchemaValidator } from '../../../common/validators/baseSuccessMessageSchemaValidator/baseSuccessMessageSchemaValidator.ts';

export interface ReadySuccessResponseValidatorProps {
  readonly event: MessageEvent<ReadyRes>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
}
const INVALID_SCHEMA_ERROR_MESSAGE = 'INVALID READY RESPONSE SCHEMA';
const INVALID_TYPE_ERROR_MESSAGE = 'INVALID READY RESPONSE SCHEMA';
export const readyResValidator = async ({
  expectedSource,
  validOrigins,
  deviceId,
  event,
}: ReadySuccessResponseValidatorProps): Promise<true> => {
  if (event.data.type !== 'READY') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }

  baseSuccessMessageSchemaValidator(event.data, INVALID_SCHEMA_ERROR_MESSAGE);
  if (event.data.payload !== undefined) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }

  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  originValidator(validOrigins, event.origin);
  sourceValidator(expectedSource, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  return true;
};
