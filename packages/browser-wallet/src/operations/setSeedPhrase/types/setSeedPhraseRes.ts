import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { WalletStatus } from '../../getWalletStatus/types/WalletStatus.ts';

export type SetSeedPhraseRes = SafetySuccessResponse<
  'CREATE_OR_ADD_SEED',
  WalletStatus
>;
