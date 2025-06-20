import { nonceValidator } from '../nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../timestampValidator/timestampValidator.ts';
import { originValidator } from '../originValidator/originValidator.ts';
import { sourceValidator } from '../sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../deviceIdValidator/deviceIdValidator.ts';

import { errorMessageSchemaValidator } from '../errorMessageSchemaValidator/errorMessageSchemaValidator.ts';

import { AnyErrorResponse } from '../../../operations/AnyOperation.ts';

export interface ErrorResponseValidatorProps {
  readonly event: MessageEvent<AnyErrorResponse>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
}
export const errorResponseValidator = async ({
  event,
  validOrigins,
  deviceId,
  expectedSource,
}: ErrorResponseValidatorProps): Promise<true> => {
  errorMessageSchemaValidator(event.data, 'Error in schema');
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  originValidator(validOrigins, event.origin);
  sourceValidator(expectedSource, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  return true;
};
