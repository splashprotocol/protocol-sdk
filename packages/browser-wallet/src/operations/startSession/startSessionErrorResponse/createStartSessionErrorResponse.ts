import { StartSessionErrorResponse } from '../types/StartSessionErrorResponse.ts';
import { createErrorResponse } from '../../../common/utils/createErrorResponse/createErrorResponse.ts';

export const createStartSessionErrorResponse = (
  deviceId: string,
  message: string,
  sessionEnd?: boolean,
): StartSessionErrorResponse =>
  createErrorResponse('START_SESSION', deviceId, message, sessionEnd);
