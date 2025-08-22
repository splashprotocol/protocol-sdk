import { Session } from '../../../common/models/Session/Session.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { DeviceKeyResult } from '../types/DeviceKeyResult.ts';
import { GenerateDeviceKeyRes } from '../types/GenerateDeviceKeyRes.ts';

export interface CreateGenerateDeviceKeyResParams {
  readonly deviceId: string;
  readonly requestId: string;
  readonly session: Session;
  readonly payload: DeviceKeyResult;
}

export const createGenerateDeviceKeyRes = async ({
  deviceId,
  requestId,
  session,
  payload,
}: CreateGenerateDeviceKeyResParams): Promise<GenerateDeviceKeyRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    type: 'GENERATE_DEVICE_KEY',
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
