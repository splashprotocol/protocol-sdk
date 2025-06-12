import { BaseResponse } from '../../../common/types/SuccessResponse.ts';
import { WalletStatus } from './WalletStatus.ts';

export type GetWalletStatusSuccessResponse = BaseResponse<
  'GET_STATUS',
  WalletStatus
>;
