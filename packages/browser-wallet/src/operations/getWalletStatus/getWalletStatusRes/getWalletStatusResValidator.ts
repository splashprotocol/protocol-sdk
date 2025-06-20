import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { GetWalletStatusRes } from '../types/GetWalletStatusRes.ts';
import { baseSuccessMessageSchemaValidator } from '../../../common/validators/baseSuccessMessageSchemaValidator/baseSuccessMessageSchemaValidator.ts';
import { WalletStatus } from '../types/WalletStatus.ts';

export const walletStatuses: WalletStatus[] = [
  'SEED_REQUIRED',
  'PIN_REQUIRED',
  'NO_SESSION',
  'READY_TO_SIGN',
];

export interface GetWalletStatusResValidatorProps {
  readonly event: MessageEvent<GetWalletStatusRes>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
}
const INVALID_SCHEMA_ERROR_MESSAGE =
  'INVALID GET STATUS SUCCESS RESPONSE SCHEMA';
const INVALID_TYPE_ERROR_MESSAGE = 'INVALID GET SUCCESS STATUS RESPONSE SCHEMA';
export const getWalletStatusResValidator = async ({
  event,
  deviceId,
  validOrigins,
  expectedSource,
}: GetWalletStatusResValidatorProps): Promise<true> => {
  if (event.data.type !== 'GET_STATUS') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  baseSuccessMessageSchemaValidator(event.data, INVALID_SCHEMA_ERROR_MESSAGE);
  if (!walletStatuses.includes(event.data.payload)) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  originValidator(validOrigins, event.origin);
  sourceValidator(expectedSource, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  return true;
};
