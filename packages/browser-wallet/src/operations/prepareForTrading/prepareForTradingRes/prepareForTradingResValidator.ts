import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { signatureValidator } from '../../../common/validators/signatureValidator/signatureValidator.ts';
import { PrepareForTradingRes } from '../types/PrepareForTradingRes.ts';
import { CommunicationPublicKey } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { safetyResponseSchemaValidator } from '../../../common/validators/safetyResponseSchemaValidator/safetyResponseSchemaValidator.ts';

export interface PrepareForTradingResValidatorParams {
  readonly event: MessageEvent<PrepareForTradingRes>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
  readonly publicKey: CommunicationPublicKey;
}

const INVALID_TYPE_ERROR_MESSAGE =
  'INVALID PREPARE FOR TRADING SUCCESS RESPONSE TYPE';
const INVALID_SCHEMA_ERROR_MESSAGE =
  'INVALID PREPARE FOR TRADING SUCCESS RESPONSE SCHEMA';

export const prepareForTradingResValidator = async ({
  event,
  deviceId,
  validOrigins,
  expectedSource,
  publicKey,
}: PrepareForTradingResValidatorParams): Promise<true> => {
  if (event.data.type !== 'PREPARE_FOR_TRADING') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }

  safetyResponseSchemaValidator(event.data, INVALID_SCHEMA_ERROR_MESSAGE);

  const payload = event.data.payload;
  if (typeof payload.pk !== 'string') {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  if (typeof payload.pkh !== 'string') {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  if (typeof payload.skh !== 'string') {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }

  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  originValidator(validOrigins, event.origin);
  sourceValidator(expectedSource, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  await signatureValidator(publicKey, event.data, deviceId);

  return true;
};
