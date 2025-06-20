import { StartSessionReq } from '../types/StartSessionReq.ts';
import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { requestIdValidator } from '../../../common/validators/requestIdValidator/requestIdValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { signatureValidator } from '../../../common/validators/signatureValidator/signatureValidator.ts';
import { noSessionRequestSchemaValidator } from '../../../common/validators/noSessionRequestSchemaValidator/noSessionRequestSchemaValidator.ts';

const INVALID_SCHEMA_ERROR_MESSAGE = 'INVALID START SESSION REQUEST SCHEMA';
const INVALID_TYPE_ERROR_MESSAGE = 'INVALID START SESSION REQUEST TYPE';
export interface StartSessionReqValidatorProps {
  readonly event: MessageEvent<StartSessionReq>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
}
export const startSessionReqValidator = async ({
  event,
  validOrigins,
  deviceId,
  expectedSource,
}: StartSessionReqValidatorProps): Promise<true> => {
  if (event.data.type !== 'START_SESSION') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  noSessionRequestSchemaValidator(event.data, INVALID_SCHEMA_ERROR_MESSAGE);
  if (!(event.data.payload instanceof Uint8Array)) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  requestIdValidator(event.data.requestId);
  originValidator(validOrigins, event.origin);
  sourceValidator(expectedSource, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  await signatureValidator(event.data.payload, event.data, deviceId);
  return true;
};
