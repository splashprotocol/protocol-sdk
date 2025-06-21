import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { requestIdValidator } from '../../../common/validators/requestIdValidator/requestIdValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { baseMessageSchemaValidator } from '../../../common/validators/baseMessageSchemaValidator/baseMessageSchemaValidator.ts';
import { Session } from '../../../common/models/Session/Session.ts';
import { sessionIdValidator } from '../../../common/validators/sessionIdValidator/sessionIdValidator.ts';
import { signatureValidator } from '../../../common/validators/signatureValidator/signatureValidator.ts';
import { SetThemeReq } from '../types/SetThemeReq.ts';

export interface SetThemeReqValidatorParams {
  readonly event: MessageEvent<SetThemeReq>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
  readonly session: Session;
}
const INVALID_SCHEMA_ERROR_MESSAGE = 'INVALID SET THEME REQUEST SCHEMA';
const INVALID_TYPE_ERROR_MESSAGE = 'INVALID SET THEME REQUEST TYPE';
export const setThemeReqValidator = async ({
  event,
  deviceId,
  validOrigins,
  expectedSource,
  session,
}: SetThemeReqValidatorParams): Promise<true> => {
  if (event.data.type !== 'SET_THEME') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  baseMessageSchemaValidator(event.data, INVALID_SCHEMA_ERROR_MESSAGE);
  if (event.data.payload !== 'dark' && event.data.payload !== 'light') {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  requestIdValidator(event.data.requestId);
  originValidator(validOrigins, event.origin);
  await sessionIdValidator(event.data.sessionId, session);
  await signatureValidator(session.anotherSidePublicKey, event.data, deviceId);
  sourceValidator(expectedSource, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  return true;
};
