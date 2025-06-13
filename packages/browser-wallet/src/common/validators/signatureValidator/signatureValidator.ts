import { CommunicationPublicKey } from '../../models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { NoSessionRequest, SafetyRequest } from '../../types/Request.ts';
import {
  NoSessionResponse,
  SafetySuccessResponse,
} from '../../types/SuccessResponse.ts';
import { generateMessageForSign } from '../../utils/generateMessageForSign/generateMessageForSign.ts';

const ERROR_MESSAGE = 'INVALID SIGNATURE';

export const signatureValidator = async (
  publicKey: CommunicationPublicKey | Uint8Array,
  requestOrResponse:
    | NoSessionRequest<any, any>
    | NoSessionResponse<any, any>
    | SafetyRequest<any, any>
    | SafetySuccessResponse<any, any>,
  deviceId: string,
) => {
  const message = generateMessageForSign(
    requestOrResponse.payload,
    requestOrResponse.timestamp,
    deviceId,
    requestOrResponse.requestId,
    requestOrResponse.nonce,
  );
  const normalizedPublicKey =
    publicKey instanceof CommunicationPublicKey
      ? publicKey
      : await CommunicationPublicKey.fromBytes(publicKey);
  const result = await normalizedPublicKey.verify(
    message,
    requestOrResponse.signature,
  );

  if (!result) {
    throw new Error(ERROR_MESSAGE);
  }
  return result;
};
