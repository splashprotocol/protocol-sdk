import { BaseSuccessResponse } from '../../../common/types/SuccessResponse.ts';
import { WalletStatus } from './WalletStatus.ts';

export type GetWalletStatusSuccessResponse = BaseSuccessResponse<
  'GET_STATUS',
  WalletStatus
>;
