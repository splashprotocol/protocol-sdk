import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { signatureValidator } from '../../../common/validators/signatureValidator/signatureValidator.ts';
import { CreateOrAddSeedPhraseSuccessResponse } from '../types/CreateOrAddSeedPhraseSuccessResponse.ts';
import { safetyResponseSchemaValidator } from '../../../common/validators/safetyResponseSchemaValidator/safetyResponseSchemaValidator.ts';
import { walletStatuses } from '../../getWalletStatus/getWalletStatusSuccessResponse/getWalletStatusSuccessResponseValidator.ts';
import { CommunicationPublicKey } from '../../../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';

const INVALID_SCHEMA_ERROR_MESSAGE =
  'INVALID CREATE OR ADD SEED PHRASE SUCCESS RESPONSE SCHEMA';
const startSessionSuccessSchemaValidator = (
  successResponse: CreateOrAddSeedPhraseSuccessResponse,
): true => {
  safetyResponseSchemaValidator(successResponse, INVALID_SCHEMA_ERROR_MESSAGE);
  if (!walletStatuses.includes(successResponse.payload)) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  return true;
};

export interface CreateOrAddSeedPhraseSuccessResponseValidatorProps {
  readonly event: MessageEvent<CreateOrAddSeedPhraseSuccessResponse>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
  readonly publicKey: CommunicationPublicKey;
}
const INVALID_TYPE_ERROR_MESSAGE =
  'INVALID CREATE OR ADD SEED PHRASE SUCCESS RESPONSE SCHEMA';
export const createOrAddSeedPhraseSuccessResponseValidator = async ({
  event,
  deviceId,
  validOrigins,
  expectedSource,
  publicKey,
}: CreateOrAddSeedPhraseSuccessResponseValidatorProps): Promise<true> => {
  if (event.data.type !== 'CREATE_OR_ADD_SEED') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  startSessionSuccessSchemaValidator(event.data);
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  originValidator(validOrigins, event.origin);
  sourceValidator(expectedSource, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  await signatureValidator(publicKey, event.data, deviceId);

  return true;
};
