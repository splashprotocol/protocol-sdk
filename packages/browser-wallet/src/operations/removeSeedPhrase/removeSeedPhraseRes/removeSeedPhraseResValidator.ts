import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { signatureValidator } from '../../../common/validators/signatureValidator/signatureValidator.ts';

import { CommunicationPublicKey } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { safetyResponseSchemaValidator } from '../../../common/validators/safetyResponseSchemaValidator/safetyResponseSchemaValidator.ts';
import { RemoveSeedPhraseRes } from '../types/RemoveSeedPhraseRes.ts';
import { walletStatuses } from '../../getWalletStatus/getWalletStatusRes/getWalletStatusResValidator.ts';

export interface RemoveSeedPhraseResValidatorParams {
  readonly event: MessageEvent<RemoveSeedPhraseRes>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
  readonly publicKey: CommunicationPublicKey;
}
const INVALID_TYPE_ERROR_MESSAGE =
  'INVALID REMOVE SEED PHRASE SUCCESS RESPONSE SCHEMA';
const INVALID_SCHEMA_ERROR_MESSAGE =
  'INVALID SREMOVE SEED PHRASE SUCCESS RESPONSE SCHEMA';
export const removeSeddPhraseResValidator = async ({
  event,
  deviceId,
  validOrigins,
  expectedSource,
  publicKey,
}: RemoveSeedPhraseResValidatorParams): Promise<true> => {
  if (event.data.type !== 'REMOVE_SEED') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  safetyResponseSchemaValidator(event.data, INVALID_SCHEMA_ERROR_MESSAGE);
  if (!walletStatuses.includes(event.data.payload)) {
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
