import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { signatureValidator } from '../../../common/validators/signatureValidator/signatureValidator.ts';
import { safetyResponseSchemaValidator } from '../../../common/validators/safetyResponseSchemaValidator/safetyResponseSchemaValidator.ts';
import { CommunicationPublicKey } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { EnterPinSuccessRes } from '../types/EnterPinSuccessRes.ts';
import { PinStatus } from '../types/PinStatus.ts';

export interface EnterPinResValidatorParams {
  readonly event: MessageEvent<EnterPinSuccessRes>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
  readonly publicKey: CommunicationPublicKey;
}

const pinStatuses: PinStatus[] = [
  'DISCONNECT',
  'SEED_REQUIRED',
  'PIN_REQUIRED',
  'NO_SESSION',
  'READY_TO_SIGN',
];

const INVALID_SCHEMA_ERROR_MESSAGE =
  'INVALID ENTER PIN SUCCESS RESPONSE SCHEMA';
const INVALID_TYPE_ERROR_MESSAGE = 'INVALID ENTER PIN SUCCESS RESPONSE';
export const enterPinResValidator = async ({
  event,
  deviceId,
  validOrigins,
  expectedSource,
  publicKey,
}: EnterPinResValidatorParams): Promise<true> => {
  if (event.data.type !== 'ENTER_PIN') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  safetyResponseSchemaValidator(event.data, INVALID_SCHEMA_ERROR_MESSAGE);
  if (!pinStatuses.includes(event.data.payload)) {
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
