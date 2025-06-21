import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { WalletStatus } from '../../getWalletStatus/types/WalletStatus.ts';

export type RemoveSeedPhraseRes = SafetySuccessResponse<
  'REMOVE_SEED',
  WalletStatus
>;
