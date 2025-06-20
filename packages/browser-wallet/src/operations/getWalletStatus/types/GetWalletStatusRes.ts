import { BaseSuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { WalletStatus } from './WalletStatus.ts';

export type GetWalletStatusRes = BaseSuccessResponse<
  'GET_STATUS',
  WalletStatus
>;
