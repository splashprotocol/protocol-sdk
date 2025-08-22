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
import { PrepareForTradingReq } from '../types/PrepareForTradingReq.ts';

export interface PrepareForTradingReqValidatorParams {
  readonly event: MessageEvent<PrepareForTradingReq>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
  readonly session: Session;
}

const INVALID_SCHEMA_ERROR_MESSAGE =
  'INVALID PREPARE FOR TRADING REQUEST SCHEMA';
const INVALID_TYPE_ERROR_MESSAGE = 'INVALID PREPARE FOR TRADING REQUEST TYPE';

const validateSeedData = (seed: any): boolean => {
  if (seed === undefined) return true;
  return (
    seed &&
    seed.iv instanceof Uint8Array &&
    seed.salt instanceof Uint8Array &&
    seed.ciphertext instanceof Uint8Array
  );
};

const validateSessionData = (session: any): boolean => {
  if (session === undefined) return true;
  return (
    session &&
    session.iv instanceof Uint8Array &&
    session.ciphertext instanceof Uint8Array &&
    session.ephemeralPublicKey instanceof Uint8Array
  );
};

const validateDeviceKeys = (deviceKeys: any): boolean => {
  return (
    deviceKeys &&
    deviceKeys.publicKey instanceof Uint8Array &&
    (deviceKeys.privateKey === undefined ||
      deviceKeys.privateKey instanceof Uint8Array)
  );
};

export const prepareForTradingReqValidator = async ({
  event,
  deviceId,
  validOrigins,
  expectedSource,
  session,
}: PrepareForTradingReqValidatorParams): Promise<true> => {
  if (event.data.type !== 'PREPARE_FOR_TRADING') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }

  baseMessageSchemaValidator(event.data, INVALID_SCHEMA_ERROR_MESSAGE);

  // Validate payload structure
  const payload = event.data.payload;
  if (!payload) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }

  if (!validateSeedData(payload.seed)) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }

  if (!validateSessionData(payload.session)) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }

  if (!validateDeviceKeys(payload.deviceKeys)) {
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
