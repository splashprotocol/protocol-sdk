import { GetWalletStatusReq } from '../types/GetWalletStatusReq.ts';
import { nonceValidator } from '../../../common/validators/nonceValidator/nonceValidator.ts';
import { timestampValidator } from '../../../common/validators/timestampValidator/timestampValidator.ts';
import { requestIdValidator } from '../../../common/validators/requestIdValidator/requestIdValidator.ts';
import { sourceValidator } from '../../../common/validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../../common/validators/deviceIdValidator/deviceIdValidator.ts';
import { originValidator } from '../../../common/validators/originValidator/originValidator.ts';
import { baseMessageSchemaValidator } from '../../../common/validators/baseMessageSchemaValidator/baseMessageSchemaValidator.ts';

export interface GetWalletStatusRequestValidatorProps {
  readonly event: MessageEvent<GetWalletStatusReq>;
  readonly deviceId: string;
  readonly validOrigins: string[];
  readonly expectedSource: MessageEventSource | null;
}
const INVALID_SCHEMA_ERROR_MESSAGE = 'INVALID GET STATUS REQUEST SCHEMA';
const INVALID_TYPE_ERROR_MESSAGE = 'INVALID GET STATUS REQUEST TYPE';
export const getWalletStatusReqValidator = async ({
  event,
  deviceId,
  validOrigins,
  expectedSource,
}: GetWalletStatusRequestValidatorProps): Promise<true> => {
  if (event.data.type !== 'GET_STATUS') {
    throw new Error(INVALID_TYPE_ERROR_MESSAGE);
  }
  baseMessageSchemaValidator(event.data, INVALID_SCHEMA_ERROR_MESSAGE);
  if (event.data.payload !== undefined) {
    throw new Error(INVALID_SCHEMA_ERROR_MESSAGE);
  }
  nonceValidator(event.data.nonce);
  timestampValidator(event.data.timestamp);
  requestIdValidator(event.data.requestId);
  originValidator(validOrigins, event.origin);
  sourceValidator(expectedSource, event.source);
  deviceIdValidator(event.data.deviceId, deviceId);
  return true;
};
