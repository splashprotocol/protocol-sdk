import { ErrorResponse } from '../../types/ErrorResponse.ts';
import { OperationType } from '../../types/OperationType.ts';
import { generateRequestId } from '../generateRequestId/generateRequestId.ts';
import { generateNonce } from '../generateNonce/generateNonce.ts';

export const createErrorResponse = (
  type: OperationType,
  message: string,
  deviceId: string,
): ErrorResponse<OperationType> => {
  return {
    deviceId,
    type,
    message,
    timestamp: Date.now(),
    requestId: generateRequestId(),
    nonce: generateNonce(),
    kind: 'error',
  };
};
