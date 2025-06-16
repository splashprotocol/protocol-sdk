import { AnyRequest } from '../../AnyOperation.ts';
import { StartSessionRequest } from '../types/StartSessionRequest.ts';

export const isStartSessionRequest = (
  request: AnyRequest,
): request is StartSessionRequest => {
  return request.type === 'START_SESSION';
};

export const isStartSessionRequestMessage = (
  event: MessageEvent<AnyRequest>,
): event is MessageEvent<StartSessionRequest> => {
  return event.data.type === 'START_SESSION';
};
