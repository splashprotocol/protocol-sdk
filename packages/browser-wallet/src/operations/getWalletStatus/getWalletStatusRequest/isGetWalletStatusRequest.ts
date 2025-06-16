import { AnyRequest } from '../../AnyOperation.ts';
import { GetWalletStatusRequest } from '../types/GetWalletStatusRequest.ts';

export const isGetWalletStatusRequest = (
  request: AnyRequest,
): request is GetWalletStatusRequest => {
  return request.type === 'GET_STATUS';
};

export const isGetWalletStatusRequestMessage = (
  event: MessageEvent<AnyRequest>,
): event is MessageEvent<GetWalletStatusRequest> => {
  return event.data.type === 'GET_STATUS';
};
