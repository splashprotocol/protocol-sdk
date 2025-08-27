import { Session } from '../../../common/models/Session/Session.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { GetExistedDevicePublicKeyRes } from '../types/GetExistedDevicePublicKeyRes.ts';

export interface CreateGetExistedDevicePublicKeyResParams {
  readonly deviceId: string;
  readonly requestId: string;
  readonly session: Session;
  readonly payload: Uint8Array | undefined;
}

export const createGetExistedDevicePublicKeyRes = async ({
  deviceId,
  requestId,
  session,
  payload,
}: CreateGetExistedDevicePublicKeyResParams): Promise<GetExistedDevicePublicKeyRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    type: 'GET_EXISTED_DEVICE_PUBLIC_KEY',
    kind: 'success',
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
