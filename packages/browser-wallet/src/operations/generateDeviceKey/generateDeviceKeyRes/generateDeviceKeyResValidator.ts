import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { signatureValidator } from '../../../common/validators/signatureValidator/signatureValidator.ts';

import { CommunicationPublicKey } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { safetyResponseSchemaValidator } from '../../../common/validators/safetyResponseSchemaValidator/safetyResponseSchemaValidator.ts';
import { GenerateDeviceKeyRes } from '../types/GenerateDeviceKeyRes.ts';

export interface GenerateDeviceKeyResValidatorParams {
  readonly event: MessageEvent<GenerateDeviceKeyRes>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
  readonly publicKey: CommunicationPublicKey;
}

const INVALID_TYPE_ERROR_MESSAGE =
  'INVALID GENERATE DEVICE KEY SUCCESS RESPONSE TYPE';
const INVALID_SCHEMA_ERROR_MESSAGE =
  'INVALID GENERATE DEVICE KEY SUCCESS RESPONSE SCHEMA';

export const generateDeviceKeyResValidator = async ({
  event,
  deviceId,
  validOrigins,
  expectedSource,
  publicKey,
}: GenerateDeviceKeyResValidatorParams): Promise<true> => {
  if (event.data.type !== 'GENERATE_DEVICE_KEY') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  safetyResponseSchemaValidator(event.data, INVALID_SCHEMA_ERROR_MESSAGE);

  const payload = event.data.payload;
  if (typeof payload.storageAccess !== 'string') {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  if (
    payload.storageAccess !== 'allowed' &&
    payload.storageAccess !== 'restricted'
  ) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  if (typeof payload.publicKey !== 'string') {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }

  if (payload.storageAccess === 'restricted') {
    if (typeof payload.privateKey !== 'string') {
      throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
    }
  } else if (payload.storageAccess === 'allowed') {
    if ('privateKey' in payload) {
      throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
    }
  }

  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  originValidator(validOrigins, event.origin);
  sourceValidator(expectedSource, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  await signatureValidator(publicKey, event.data, deviceId);

  return true;
};
