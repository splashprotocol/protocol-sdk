import { SafetySuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { WalletInfo } from './WalletInfo.ts';

export type GetWalletInfoRes = SafetySuccessResponse<
  'GET_WALLET_INFO',
  WalletInfo
>;
