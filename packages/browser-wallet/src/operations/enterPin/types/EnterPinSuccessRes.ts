import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { WalletStatus } from '../../getWalletStatus/types/WalletStatus.ts';

export type EnterPinSuccessRes = SafetySuccessResponse<
  'ENTER_PIN',
  WalletStatus | 'DISCONNECT'
>;
