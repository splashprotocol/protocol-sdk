import { Session } from '../../../common/models/Session/Session.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';

import { WalletStatus } from '../../getWalletStatus/types/WalletStatus.ts';
import { EnterPinSuccessResponse } from '../types/EnterPinSuccessResponse.ts';

export interface CreateEnterPinSuccessResponseParams {
  readonly deviceId: string;
  readonly requestId: string;
  readonly session: Session;
  readonly walletStatus: WalletStatus | 'DISCONNECT';
}
export const createEnterPinSuccessResponse = async ({
  deviceId,
  requestId,
  session,
  walletStatus,
}: CreateEnterPinSuccessResponseParams): Promise<EnterPinSuccessResponse> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    type: 'ENTER_PIN',
    kind: 'success',
    deviceId,
    timestamp,
    nonce,
    requestId,
    payload: walletStatus,
    signature: await session.communicationResponseKeys.privateKey.sign(
      generateMessageForSign(
        walletStatus,
        timestamp,
        deviceId,
        requestId,
        nonce,
      ),
    ),
  };
};
