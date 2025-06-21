import { Session } from '../../../common/models/Session/Session.ts';
import { generateNonce } from '../../../common/utils/generateNonce/generateNonce.ts';
import { generateMessageForSign } from '../../../common/utils/generateMessageForSign/generateMessageForSign.ts';
import { RemoveSeedPhraseRes } from '../types/RemoveSeedPhraseRes.ts';
import { WalletStatus } from '../../getWalletStatus/types/WalletStatus.ts';

export interface CreateRemoveSeedPhraseResParams {
  readonly deviceId: string;
  readonly requestId: string;
  readonly session: Session;
  readonly walletStatus: WalletStatus;
}
export const createRemoveSeedPhraseRes = async ({
  deviceId,
  requestId,
  session,
  walletStatus,
}: CreateRemoveSeedPhraseResParams): Promise<RemoveSeedPhraseRes> => {
  const timestamp = Date.now();
  const nonce = generateNonce();

  return {
    type: 'REMOVE_SEED',
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
