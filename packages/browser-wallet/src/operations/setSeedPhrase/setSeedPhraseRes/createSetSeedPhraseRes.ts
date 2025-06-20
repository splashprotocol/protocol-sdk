import { Session } from '../../../common/models/Session/Session.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { SetSeedPhraseRes } from '../types/setSeedPhraseRes.ts';
import { WalletStatus } from '../../getWalletStatus/types/WalletStatus.ts';

export interface CreateSetSeedPhraseResParams {
  readonly deviceId: string;
  readonly requestId: string;
  readonly session: Session;
  readonly walletStatus: WalletStatus;
}
export const createSetSeedPhraseRes = async ({
  deviceId,
  requestId,
  session,
  walletStatus,
}: CreateSetSeedPhraseResParams): Promise<SetSeedPhraseRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    type: 'CREATE_OR_ADD_SEED',
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
