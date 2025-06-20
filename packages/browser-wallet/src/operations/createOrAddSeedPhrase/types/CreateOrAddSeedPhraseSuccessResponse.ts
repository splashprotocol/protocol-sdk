import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { WalletStatus } from '../../getWalletStatus/types/WalletStatus.ts';

export type CreateOrAddSeedPhraseSuccessResponse = SafetySuccessResponse<
  'CREATE_OR_ADD_SEED',
  WalletStatus
>;
