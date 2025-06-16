import { Session } from '../../../common/models/Session/Session.ts';
import { StartSessionSuccessResponse } from '../types/StartSessionSuccessResponse.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';

export const createStartSessionSuccessResponse = async (
  deviceId: string,
  requestId: string,
  session: Session,
): Promise<StartSessionSuccessResponse> => {
  const timestamp = Date.now();
  const nonce = generateNonce();
  const payload = await session.communicationResponseKeys.publicKey.toBytes();

  return {
    type: 'START_SESSION',
    kind: 'success',
    sessionId: session.id.data,
    deviceId,
    timestamp,
    nonce,
    requestId,
    payload,
    signature: await session.communicationResponseKeys.privateKey.sign(
      generateMessageForSign(payload, timestamp, deviceId, requestId, nonce),
    ),
  };
};
